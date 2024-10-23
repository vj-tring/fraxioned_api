import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LoggerService } from './logger.service';
import { S3UtilsService } from './s3-utils.service';
import { getMaxFileCount } from '../utils/image-file.utils';
import { ApiResponse } from '../commons/response-body/common.responses';
import { PropertyAdditionalImage } from '../entities/property-additional-image.entity';
import { CreatePropertyAdditionalImageDto } from '../dto/requests/property-additional-image/create-property-additional-image.dto';
import { PropertiesService } from './properties.service';
import { UserService } from './user.service';
import { PropertySpaceImageService } from './property-space-image.service';
import { PROPERTY_ADDITIONAL_IMAGE_RESPONSES } from '../commons/constants/response-constants/property-additional-image.constant';
import { UpdatePropertyAdditionalImageDto } from '../dto/requests/property-additional-image/update-property-additional-image.dto';

@Injectable()
export class PropertyAdditionalImageService {
  constructor(
    @InjectRepository(PropertyAdditionalImage)
    private readonly propertyAdditionalImageRepository: Repository<PropertyAdditionalImage>,
    private readonly userService: UserService,
    private readonly s3UtilsService: S3UtilsService,
    @Inject(forwardRef(() => PropertiesService))
    private readonly propertyService: PropertiesService,
    @Inject(forwardRef(() => PropertySpaceImageService))
    private readonly propertySpaceImageService: PropertySpaceImageService,
    private readonly logger: LoggerService,
  ) {}

  async getImageCountForPropertyFromPropertyAdditionalImage(
    propertyId: number,
  ): Promise<number> {
    const imageCount = await this.propertyAdditionalImageRepository.count({
      relations: ['createdBy', 'updatedBy', 'property'],
      select: {
        createdBy: {
          id: true,
        },
        updatedBy: {
          id: true,
        },
        property: {
          id: true,
          propertyName: true,
        },
      },
      where: { property: { id: propertyId } },
    });

    return imageCount;
  }

  async findAllPropertyAdditionalImagesByPropertyId(
    propertyId: number,
  ): Promise<PropertyAdditionalImage[] | null> {
    return await this.propertyAdditionalImageRepository.find({
      relations: ['property', 'createdBy', 'updatedBy'],
      select: {
        createdBy: { id: true },
        updatedBy: { id: true },
        property: {
          id: true,
          propertyName: true,
        },
      },
      where: { property: { id: propertyId } },
    });
  }

  async findPropertyAdditionalImageById(
    id: number,
  ): Promise<PropertyAdditionalImage | null> {
    return await this.propertyAdditionalImageRepository.findOne({
      relations: ['property', 'createdBy', 'updatedBy'],
      select: {
        createdBy: {
          id: true,
        },
        updatedBy: {
          id: true,
        },
        property: {
          id: true,
          propertyName: true,
        },
      },
      where: { id },
    });
  }

  async handlePropertyAdditionalImageNotFound(): Promise<ApiResponse<null>> {
    this.logger.error(`Property Additional Image not found`);
    return PROPERTY_ADDITIONAL_IMAGE_RESPONSES.PROPERTY_ADDITIONAL_IMAGE_NOT_FOUND();
  }

  async createPropertyAdditionalImages(
    createPropertyAdditionalImageDtos: CreatePropertyAdditionalImageDto[],
  ): Promise<ApiResponse<PropertyAdditionalImage[]>> {
    try {
      const propertyId = createPropertyAdditionalImageDtos[0].property.id;
      const createdByUserId = createPropertyAdditionalImageDtos[0].createdBy.id;

      const existingProperty =
        await this.propertyService.findPropertyById(propertyId);
      if (!existingProperty) {
        return await this.propertyService.handlePropertyNotFound(propertyId);
      }

      const existingUser = await this.userService.findUserById(createdByUserId);
      if (!existingUser) {
        return await this.userService.handleUserNotFound(createdByUserId);
      }

      const existingImageCount =
        (await this.getImageCountForPropertyFromPropertyAdditionalImage(
          propertyId,
        )) +
        (await this.propertySpaceImageService.getImageCountForPropertyFromPropertySpaceImage(
          propertyId,
        ));
      const maxFileCount = getMaxFileCount();

      if (
        existingImageCount + createPropertyAdditionalImageDtos.length >
        maxFileCount
      ) {
        return await this.propertySpaceImageService.handleImageUploadLimitExceeded(
          maxFileCount,
          existingImageCount,
        );
      }

      const uploadPromises = createPropertyAdditionalImageDtos.map(
        async (dto) => {
          const newImage = this.propertyAdditionalImageRepository.create({
            ...dto,
          });

          const savedImage =
            await this.propertyAdditionalImageRepository.save(newImage);

          const folderName = `properties_media/${existingProperty.id}/property_additional_images`;
          const fileExtension = dto.imageFile.originalname.split('.').pop();
          const fileName = `additional_image_${savedImage.id}.${fileExtension}`;

          const imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
            folderName,
            fileName,
            dto.imageFile.buffer,
            dto.imageFile.mimetype,
          );

          savedImage.url = imageUrlLocation;
          return await this.propertyAdditionalImageRepository.save(savedImage);
        },
      );

      const savedImages = await Promise.all(uploadPromises);
      this.logger.log(
        `${savedImages.length} property additional images created successfully`,
      );
      return PROPERTY_ADDITIONAL_IMAGE_RESPONSES.PROPERTY_ADDITIONAL_IMAGES_CREATED(
        savedImages,
      );
    } catch (error) {
      this.logger.error(
        `Error creating property additional images: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        `An error occurred while creating the property additional images`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPropertyAdditionalImageDetailById(
    id: number,
  ): Promise<ApiResponse<PropertyAdditionalImage>> {
    try {
      const propertyAdditionalImage =
        await this.findPropertyAdditionalImageById(id);

      if (!propertyAdditionalImage) {
        return await this.handlePropertyAdditionalImageNotFound();
      }
      this.logger.log(`Property Space Image retrieved successfully`);
      return PROPERTY_ADDITIONAL_IMAGE_RESPONSES.PROPERTY_ADDITIONAL_IMAGE_FETCHED(
        propertyAdditionalImage,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property additional image with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the property additional image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPropertyAdditionalImagesByPropertyId(
    propertyId: number,
  ): Promise<ApiResponse<PropertyAdditionalImage[]>> {
    try {
      const propertyAdditionalImages =
        await this.findAllPropertyAdditionalImagesByPropertyId(propertyId);
      if (propertyAdditionalImages.length === 0) {
        this.logger.log(`No property additional images found`);
        return PROPERTY_ADDITIONAL_IMAGE_RESPONSES.PROPERTY_ADDITIONAL_IMAGES_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${propertyAdditionalImages.length} property additional images`,
      );
      return PROPERTY_ADDITIONAL_IMAGE_RESPONSES.PROPERTY_ADDITIONAL_IMAGES_FETCHED(
        propertyAdditionalImages,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property additional images for property ID ${propertyId}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving property additional images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePropertyAdditionalImageById(
    id: number,
    updatePropertyAdditionalImageDto: UpdatePropertyAdditionalImageDto,
    imageFile?: Express.Multer.File,
  ): Promise<ApiResponse<PropertyAdditionalImage>> {
    try {
      const existingPropertyAdditionalImage =
        await this.findPropertyAdditionalImageById(id);
      if (!existingPropertyAdditionalImage) {
        return await this.handlePropertyAdditionalImageNotFound();
      }

      const existingUser = await this.userService.findUserById(
        updatePropertyAdditionalImageDto.updatedBy.id,
      );
      if (!existingUser) {
        return await this.userService.handleUserNotFound(
          updatePropertyAdditionalImageDto.updatedBy.id,
        );
      }
      Object.assign(
        existingPropertyAdditionalImage,
        updatePropertyAdditionalImageDto,
      );

      let imageUrlLocation = await this.s3UtilsService.handleS3KeyAndImageUrl(
        existingPropertyAdditionalImage.url,
        !!imageFile,
      );

      if (imageFile) {
        const folderName = `properties_media/${existingPropertyAdditionalImage.property.id}/property_additional_images`;
        const fileExtension = imageFile.originalname.split('.').pop();
        const fileName = `additional_image_${existingPropertyAdditionalImage.id}.${fileExtension}`;
        imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          imageFile.buffer,
          imageFile.mimetype,
        );
      }

      existingPropertyAdditionalImage.url = imageUrlLocation;

      const updatedPropertyAdditionalImage =
        await this.propertyAdditionalImageRepository.save(
          existingPropertyAdditionalImage,
        );
      this.logger.log(`Property Additional Image updated successfully`);
      return PROPERTY_ADDITIONAL_IMAGE_RESPONSES.PROPERTY_ADDITIONAL_IMAGE_UPDATED(
        updatedPropertyAdditionalImage,
      );
    } catch (error) {
      this.logger.error(
        `Error updating property additional image with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the property additional image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePropertyAdditionalImageById(
    id: number,
  ): Promise<ApiResponse<PropertyAdditionalImage>> {
    try {
      const propertyAdditionalImage =
        await this.findPropertyAdditionalImageById(id);

      if (!propertyAdditionalImage) {
        return await this.handlePropertyAdditionalImageNotFound();
      }

      await this.s3UtilsService.handleS3KeyAndImageUrl(
        propertyAdditionalImage.url,
        true,
      );

      await this.propertyAdditionalImageRepository.delete(id);
      return PROPERTY_ADDITIONAL_IMAGE_RESPONSES.PROPERTY_ADDITIONAL_IMAGE_DELETED();
    } catch (error) {
      this.logger.error(
        `Error deleting property additional image with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property additional image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePropertyAdditionalImagesByIds(
    ids: number[],
  ): Promise<ApiResponse<PropertyAdditionalImage>> {
    try {
      const propertyAdditionalImages =
        await this.propertyAdditionalImageRepository.findBy({
          id: In(ids),
        });

      const foundIds = propertyAdditionalImages.map((image) => image.id);

      const notFoundIds = ids.filter((id) => !foundIds.includes(id));

      if (notFoundIds.length > 0) {
        this.logger.log(
          `Property additional images with IDs [${notFoundIds.join(', ')}] not found in the database.`,
        );
        return PROPERTY_ADDITIONAL_IMAGE_RESPONSES.PROPERTY_ADDITIONAL_IMAGES_NOT_FOUND_FOR_IDS(
          notFoundIds,
        );
      }
      for (const image of propertyAdditionalImages) {
        if (image.url) {
          await this.s3UtilsService.handleS3KeyAndImageUrl(image.url, true);
        }
      }

      await this.propertyAdditionalImageRepository.delete(ids);

      this.logger.log(`Property Additional Images deleted successfully`);
      return PROPERTY_ADDITIONAL_IMAGE_RESPONSES.PROPERTY_ADDITIONAL_IMAGES_DELETED();
    } catch (error) {
      this.logger.error(
        `Error deleting property additional images with IDs ${ids.join(', ')}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property additional images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
