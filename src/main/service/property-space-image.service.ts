import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerService } from './logger.service';
import { PROPERTY_SPACE_IMAGE_RESPONSES } from '../commons/constants/response-constants/property-space-image.constant';
import { S3UtilsService } from './s3-utils.service';
import { PropertySpace } from '../entities/property-space.entity';
import { User } from '../entities/user.entity';
import { CreatePropertySpaceImageDto } from '../dto/requests/property-space-image/create.dto';
import { UpdatePropertySpaceImageDto } from '../dto/requests/property-space-image/update.dto';
import { PropertySpaceImage } from '../entities/property-space-image.entity';

@Injectable()
export class PropertySpaceImageService {
  constructor(
    @InjectRepository(PropertySpaceImage)
    private readonly propertySapceImageRepository: Repository<PropertySpaceImage>,
    @InjectRepository(PropertySpace)
    private readonly propertySpaceRepository: Repository<PropertySpace>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly s3UtilsService: S3UtilsService,
    private readonly logger: LoggerService,
  ) {}

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

      const uploadPromises = createPropertySpaceImageDtos.map(async (dto) => {
        const newImage = this.propertySapceImageRepository.create({
          ...dto,
          propertySpace: existingPropertySpace,
          createdBy: existingUser,
        });

        const savedImage =
          await this.propertySapceImageRepository.save(newImage);

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
        return await this.propertySapceImageRepository.save(savedImage);
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
      const propertySpaceImages = await this.propertySapceImageRepository.find({
        relations: ['propertySpace', 'createdBy', 'updatedBy'],
        select: {
          createdBy: { id: true },
          updatedBy: { id: true },
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
        await this.propertySapceImageRepository.findOne({
          where: { id },
          relations: ['propertySpace', 'createdBy', 'updatedBy'],
          select: {
            createdBy: { id: true },
            updatedBy: { id: true },
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

  async updatePropertySpaceImage(
    id: number,
    updatePropertySpaceImageDto: UpdatePropertySpaceImageDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceImage;
    statusCode: number;
  }> {
    try {
      const propertySpaceImage =
        await this.propertySapceImageRepository.findOne({
          where: { id },
          relations: ['propertySpace', 'createdBy', 'updatedBy'],
          select: {
            createdBy: { id: true },
            updatedBy: { id: true },
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

      let imageUrlLocation = propertySpaceImage.url;

      if (updatePropertySpaceImageDto.imageFile) {
        const fileExtension = updatePropertySpaceImageDto.imageFile.originalname
          .split('.')
          .pop();
        const folderName = `properties_media/${propertySpaceImage.propertySpace.id}/property_space_images/${propertySpaceImage.id}`;
        const fileName = `property_space_${propertySpaceImage.id}.${fileExtension}`;

        let s3Key = '';
        if (imageUrlLocation) {
          s3Key = await this.s3UtilsService.extractS3Key(imageUrlLocation);
        }

        if (s3Key) {
          if (decodeURIComponent(s3Key) !== `${folderName}/${fileName}`) {
            const headObject =
              await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
            if (!headObject) {
              return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGE_NOT_FOUND_IN_AWS_S3(
                s3Key,
              );
            }
            await this.s3UtilsService.deleteObjectFromS3(s3Key);
          }
        }

        imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          updatePropertySpaceImageDto.imageFile.buffer,
          updatePropertySpaceImageDto.imageFile.mimetype,
        );

        this.logger.log(
          `New image uploaded successfully to S3 with URL: ${imageUrlLocation}`,
        );
      }

      const { imageFile, ...dtoWithoutImageFile } = updatePropertySpaceImageDto;

      Object.assign(propertySpaceImage, {
        ...dtoWithoutImageFile,
        url: imageUrlLocation,
      });

      const updatedImage =
        await this.propertySapceImageRepository.save(propertySpaceImage);

      this.logger.log(`Image Details: ${imageFile}`);
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
        await this.propertySapceImageRepository.findOne({
          where: { id },
        });

      if (!propertySpaceImage) {
        return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGE_NOT_FOUND(
          id,
        );
      }

      const s3Key = await this.s3UtilsService.extractS3Key(
        propertySpaceImage.url,
      );

      const headObject =
        await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
      if (!headObject) {
        return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGE_NOT_FOUND_IN_AWS_S3(
          s3Key,
        );
      }

      await this.s3UtilsService.deleteObjectFromS3(s3Key);

      const result = await this.propertySapceImageRepository.delete(id);
      if (result.affected === 0) {
        return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGE_NOT_FOUND(
          id,
        );
      }
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
  ): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const propertySpaceImages = await this.propertySapceImageRepository.find({
        where: { propertySpace: { id: propertySpaceId } },
      });

      if (propertySpaceImages.length === 0) {
        return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGES_NOT_FOUND();
      }

      for (const propertySpaceImage of propertySpaceImages) {
        const s3Key = await this.s3UtilsService.extractS3Key(
          propertySpaceImage.url,
        );

        const headObject =
          await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
        if (!headObject) {
          this.logger.warn(`Image not found in S3 for key: ${s3Key}`);
          continue;
        }

        await this.s3UtilsService.deleteObjectFromS3(s3Key);
        await this.propertySapceImageRepository.delete(propertySpaceImage.id);
      }

      this.logger.log(
        `Deleted all images for Property Space ID ${propertySpaceId}`,
      );
      return PROPERTY_SPACE_IMAGE_RESPONSES.PROPERTY_SPACE_IMAGES_DELETED(
        propertySpaceId,
      );
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
}
