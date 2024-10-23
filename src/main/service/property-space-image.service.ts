import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LoggerService } from './logger.service';
import { PROPERTY_SPACE_IMAGE_RESPONSES } from '../commons/constants/response-constants/property-space-image.constant';
import { S3UtilsService } from './s3-utils.service';
import { PropertySpace } from '../entities/property-space.entity';
import { User } from '../entities/user.entity';
import { CreatePropertySpaceImageDto } from '../dto/requests/property-space-image/create.dto';
import { UpdatePropertySpaceImageDto } from '../dto/requests/property-space-image/update.dto';
import { PropertySpaceImage } from '../entities/property-space-image.entity';
import { getMaxFileCount } from '../utils/image-file.utils';
import { ApiResponse } from '../commons/response-body/common.responses';
import { PropertySpaceService } from './property-space.service';
import { PropertyAdditionalImageService } from './property-additional-image.service';
import { PropertyAdditionalImage } from '../entities/property-additional-image.entity';

@Injectable()
export class PropertySpaceImageService {
  constructor(
    @InjectRepository(PropertySpaceImage)
    private readonly propertySpaceImageRepository: Repository<PropertySpaceImage>,
    @InjectRepository(PropertySpace)
    private readonly propertySpaceRepository: Repository<PropertySpace>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly s3UtilsService: S3UtilsService,
    private readonly logger: LoggerService,
    @Inject(forwardRef(() => PropertySpaceService))
    private readonly propertySpaceService: PropertySpaceService,
    @Inject(forwardRef(() => PropertyAdditionalImageService))
    private readonly propertyAdditionalImageService: PropertyAdditionalImageService,
  ) {}

  async getImageCountForPropertyFromPropertySpaceImage(
    propertyId: number,
  ): Promise<number> {
    const imageCount = await this.propertySpaceImageRepository
      .createQueryBuilder('fpsi')
      .innerJoin('fpsi.propertySpace', 'fps')
      .where('fps.property_id = :propertyId', { propertyId })
      .getCount();

    return imageCount;
  }

  async handleImageUploadLimitExceeded(
    maxFileCount: number,
    existingImageCount: number,
  ): Promise<ApiResponse<null>> {
    this.logger.error(
      `Maximum image upload limit exceeded. Only ${maxFileCount - existingImageCount} image(s) is/are allowed.`,
    );
    return PROPERTY_SPACE_IMAGE_RESPONSES.IMAGE_UPLOAD_LIMIT_EXCEEDED(
      maxFileCount,
      existingImageCount,
    );
  }

  async createPropertySpaceImages(
    createPropertySpaceImageDtos: CreatePropertySpaceImageDto[],
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceImage[];
    statusCode: number;
  }> {
    try {
      const propertySpaceId = createPropertySpaceImageDtos[0].propertySpace?.id;
      const createdByUserId = createPropertySpaceImageDtos[0].createdBy.id;

      const existingPropertySpace = await this.propertySpaceRepository.findOne({
        relations: ['property', 'space'],
        select: {
          property: { id: true },
          space: { id: true },
        },
        where: { id: propertySpaceId },
      });

      if (!existingPropertySpace) {
        this.logger.error(
          `PropertySpace with ID ${propertySpaceId} does not exist`,
        );
        return PROPERTY_SPACE_IMAGE_RESPONSES.ENTITY_NOT_FOUND(
          'PropertySpace',
          propertySpaceId,
        );
      }

      const existingUser = await this.userRepository.findOne({
        where: { id: createdByUserId },
        select: { id: true },
      });
      if (!existingUser) {
        this.logger.error(`User with ID ${createdByUserId} does not exist`);
        return PROPERTY_SPACE_IMAGE_RESPONSES.ENTITY_NOT_FOUND(
          'User',
          createdByUserId,
        );
      }

      const propertyId = existingPropertySpace.property.id;

      const existingImageCount =
        (await this.propertyAdditionalImageService.getImageCountForPropertyFromPropertyAdditionalImage(
          propertyId,
        )) +
        (await this.getImageCountForPropertyFromPropertySpaceImage(propertyId));
      const maxFileCount = getMaxFileCount();

      if (
        existingImageCount + createPropertySpaceImageDtos.length >
        maxFileCount
      ) {
        return await this.handleImageUploadLimitExceeded(
          maxFileCount,
          existingImageCount,
        );
      }

      const uploadPromises = createPropertySpaceImageDtos.map(async (dto) => {
        const newImage = this.propertySpaceImageRepository.create({
          ...dto,
          propertySpace: existingPropertySpace,
          createdBy: existingUser,
        });

        const savedImage =
          await this.propertySpaceImageRepository.save(newImage);

        const folderName = `properties_media/${existingPropertySpace.property.id}/property_space_images/${propertySpaceId}`;
        const fileExtension = dto.imageFile.originalname.split('.').pop();
        const fileName = `property_space_${savedImage.id}.${fileExtension}`;

        const imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          dto.imageFile.buffer,
          dto.imageFile.mimetype,
        );

        savedImage.url = imageUrlLocation;
        return await this.propertySpaceImageRepository.save(savedImage);
      });

      const savedImages = await Promise.all(uploadPromises);
      this.logger.log(
        `${savedImages.length} property space images created successfully`,
      );
      return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGES_CREATED(
        savedImages,
      );
    } catch (error) {
      this.logger.error(
        `Error creating property space images: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        `An error occurred while creating the property space images`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllPropertySpaceImages(): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceImage[];
    statusCode: number;
  }> {
    try {
      const propertySpaceImages = await this.propertySpaceImageRepository.find({
        relations: [
          'propertySpace',
          'createdBy',
          'updatedBy',
          'propertySpace.space',
          'propertySpace.property',
        ],
        select: {
          createdBy: { id: true },
          updatedBy: { id: true },
          propertySpace: {
            id: true,
            instanceNumber: true,
            space: {
              id: true,
              name: true,
            },
            property: {
              id: true,
              propertyName: true,
            },
          },
        },
      });

      if (propertySpaceImages.length === 0) {
        this.logger.log(`No property space images are found`);
        return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGES_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${propertySpaceImages.length} property space images`,
      );
      return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGES_FETCHED(
        propertySpaceImages,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property space images: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all property space images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPropertySpaceImageById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceImage;
    statusCode: number;
  }> {
    try {
      const propertySpaceImage =
        await this.propertySpaceImageRepository.findOne({
          where: { id },
          relations: [
            'propertySpace',
            'createdBy',
            'updatedBy',
            'propertySpace.space',
            'propertySpace.property',
          ],
          select: {
            createdBy: { id: true },
            updatedBy: { id: true },
            propertySpace: {
              id: true,
              instanceNumber: true,
              space: {
                id: true,
                name: true,
              },
              property: {
                id: true,
                propertyName: true,
              },
            },
          },
        });

      if (!propertySpaceImage) {
        this.logger.error(`Property Space Image with ID ${id} not found`);
        return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGE_NOT_FOUND(
          id,
        );
      }
      this.logger.log(
        `Property Space Image with ID ${id} retrieved successfully`,
      );
      return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGE_FETCHED(
        propertySpaceImage,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property space image with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the property space image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPropertySpaceImagesByPropertyId(propertyId: number): Promise<{
    success: boolean;
    message: string;
    data?: {
      propertySpaceImages: PropertySpaceImage[];
      propertyAdditionalImages: PropertyAdditionalImage[];
    };
    statusCode: number;
  }> {
    try {
      const propertySpaceImages = await this.propertySpaceImageRepository.find({
        relations: [
          'propertySpace',
          'createdBy',
          'updatedBy',
          'propertySpace.space',
          'propertySpace.property',
        ],
        where: { propertySpace: { property: { id: propertyId } } },
        select: {
          createdBy: { id: true },
          updatedBy: { id: true },
          propertySpace: {
            id: true,
            instanceNumber: true,
            space: {
              id: true,
              name: true,
            },
            property: {
              id: true,
              propertyName: true,
            },
          },
        },
      });

      const propertyAdditionalImages =
        await this.propertyAdditionalImageService.findAllPropertyAdditionalImagesByPropertyId(
          propertyId,
        );
      if (
        propertySpaceImages.length === 0 &&
        propertyAdditionalImages.length === 0
      ) {
        this.logger.log(`No property images are found`);
        return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_IMAGES_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${propertySpaceImages.length} property space images and ${propertyAdditionalImages.length} property additional images`,
      );
      return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_IMAGES_FETCHED(
        propertySpaceImages,
        propertyAdditionalImages,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property images for property ID ${propertyId}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving property images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPropertySpaceImagesByPropertySpaceId(
    propertySpaceId: number,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceImage[];
    statusCode: number;
  }> {
    try {
      const existingPropertySpace =
        await this.propertySpaceService.findPropertySpaceById(propertySpaceId);
      if (!existingPropertySpace) {
        return this.propertySpaceService.handlePropertySpaceNotFound(
          propertySpaceId,
        );
      }
      const propertySpaceImages = await this.propertySpaceImageRepository.find({
        relations: [
          'propertySpace',
          'createdBy',
          'updatedBy',
          'propertySpace.space',
          'propertySpace.property',
        ],
        where: { propertySpace: { id: propertySpaceId } },
        select: {
          createdBy: { id: true },
          updatedBy: { id: true },
          propertySpace: {
            id: true,
            instanceNumber: true,
            space: {
              id: true,
              name: true,
            },
            property: {
              id: true,
              propertyName: true,
            },
          },
        },
      });

      if (propertySpaceImages.length === 0) {
        this.logger.log(
          `No property space images found for property space ID ${propertySpaceId}`,
        );
        return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGES_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${propertySpaceImages.length} property space images for property space ID ${propertySpaceId}`,
      );
      return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGES_FETCHED(
        propertySpaceImages,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property space images for property space ID ${propertySpaceId}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving property space images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updatePropertySpaceImage(
    id: number,
    updatePropertySpaceImageDto: UpdatePropertySpaceImageDto,
    file?: Express.Multer.File,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceImage;
    statusCode: number;
  }> {
    try {
      const propertySpaceImage =
        await this.propertySpaceImageRepository.findOne({
          where: { id },
          relations: [
            'propertySpace',
            'propertySpace.property',
            'createdBy',
            'updatedBy',
          ],
          select: {
            createdBy: { id: true },
            updatedBy: { id: true },
            propertySpace: { id: true, property: { id: true } },
          },
        });

      if (!propertySpaceImage) {
        this.logger.error(`Property Space Image with ID ${id} not found`);
        return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGE_NOT_FOUND(
          id,
        );
      }

      if (updatePropertySpaceImageDto.propertySpace) {
        const propertySpace = await this.propertySpaceRepository.findOne({
          where: { id: updatePropertySpaceImageDto.propertySpace.id },
        });
        if (!propertySpace) {
          return PROPERTY_SPACE_IMAGE_RESPONSES.ENTITY_NOT_FOUND(
            'PropertySpace',
            updatePropertySpaceImageDto.propertySpace.id,
          );
        }
      }

      if (updatePropertySpaceImageDto.updatedBy) {
        const updatedByUser = await this.userRepository.findOne({
          where: { id: updatePropertySpaceImageDto.updatedBy.id },
        });
        if (!updatedByUser) {
          return PROPERTY_SPACE_IMAGE_RESPONSES.ENTITY_NOT_FOUND(
            'User',
            updatePropertySpaceImageDto.updatedBy.id,
          );
        }
      }
      const propertyId = propertySpaceImage.propertySpace.property.id;
      Object.assign(propertySpaceImage, updatePropertySpaceImageDto);

      let imageUrlLocation = await this.s3UtilsService.handleS3KeyAndImageUrl(
        propertySpaceImage.url,
        !!file,
      );

      if (file) {
        const folderName = `properties_media/${propertyId}/property_space_images/${propertySpaceImage.propertySpace.id}`;
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `property_space_${id}.${fileExtension}`;
        imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          file.buffer,
          file.mimetype,
        );
      }
      propertySpaceImage.url = imageUrlLocation;

      const updatedImage =
        await this.propertySpaceImageRepository.save(propertySpaceImage);
      this.logger.log(
        `Property Space Image with ID ${id} updated successfully`,
      );
      return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGE_UPDATED(
        updatedImage,
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error updating property space image with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the property space image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePropertySpaceImageById(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const propertySpaceImage =
        await this.propertySpaceImageRepository.findOne({
          where: { id },
        });

      if (!propertySpaceImage) {
        return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGE_NOT_FOUND(
          id,
        );
      }

      await this.s3UtilsService.handleS3KeyAndImageUrl(
        propertySpaceImage.url,
        true,
      );

      await this.propertySpaceImageRepository.delete(id);
      return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGE_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting property space image with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property space image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePropertySpaceImagesByPropertySpaceId(
    propertySpaceId: number,
  ): Promise<void> {
    try {
      const propertySpaceImages = await this.propertySpaceImageRepository.find({
        where: { propertySpace: { id: propertySpaceId } },
      });

      const foundIds = propertySpaceImages.map((image) => image.id);

      if (propertySpaceImages.length !== 0) {
        for (const image of propertySpaceImages) {
          if (image.url) {
            await this.s3UtilsService.handleS3KeyAndImageUrl(image.url, true);
          }
        }
        await this.propertySpaceImageRepository.delete(foundIds);
      }
    } catch (error) {
      this.logger.error(
        `Error deleting property space images for Property Space ID ${propertySpaceId}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property space images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePropertySpaceImagesByIds(ids: number[]): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const propertySpaceImages =
        await this.propertySpaceImageRepository.findBy({
          id: In(ids),
        });
      const foundIds = propertySpaceImages.map((image) => image.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));
      if (notFoundIds.length > 0) {
        this.logger.log(
          `Property space images with IDs [${notFoundIds.join(', ')}] not found in the database.`,
        );
        return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGES_NOT_FOUND_FOR_IDS(
          notFoundIds,
        );
      }
      for (const image of propertySpaceImages) {
        if (image.url) {
          await this.s3UtilsService.handleS3KeyAndImageUrl(image.url, true);
        }
      }
      await this.propertySpaceImageRepository.delete(ids);
      this.logger.log(`Property Space Images deleted successfully`);
      return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGES_BULK_DELETED();
    } catch (error) {
      this.logger.error(
        `Error deleting property space images with IDs [${ids.join(', ')}]: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property space images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
