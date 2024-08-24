import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PropertyImages } from '../entities/property_images.entity';
import { CreatePropertyImagesDto } from '../dto/requests/create-property-images.dto';
import { LoggerService } from './logger.service';
import { Property } from '../entities/property.entity';
import { PROPERTY_IMAGES_RESPONSES } from '../commons/constants/response-constants/property-images.constant';
import { Space } from '../entities/space.entity';
import { SpaceTypes } from '../entities/space-types.entity';
import { S3 } from 'aws-sdk';
import { User } from '../entities/user.entity';
import { S3UtilsService } from '../service/s3-utils.service';

@Injectable()
export class PropertyImagesService {
  private readonly s3 = new S3();
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME;

  constructor(
    @InjectRepository(PropertyImages)
    private readonly propertyImagesRepository: Repository<PropertyImages>,
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    @InjectRepository(SpaceTypes)
    private readonly spaceTypesRepository: Repository<SpaceTypes>,
    private readonly s3UtilsService: S3UtilsService,
    private readonly logger: LoggerService,
  ) {}

  async createPropertyImages(
    createPropertyImagesDtos: CreatePropertyImagesDto[],
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyImages[];
    statusCode: number;
  }> {
    try {
      const propertyId = createPropertyImagesDtos[0].property.id;
      const createdByUserId = createPropertyImagesDtos[0].createdBy.id;

      const existingProperty = await this.propertiesRepository.findOne({
        where: { id: propertyId },
      });
      if (!existingProperty) {
        this.logger.error(`Property with ID ${propertyId} does not exist`);
        return PROPERTY_IMAGES_RESPONSES.PROPERTY_NOT_FOUND(propertyId);
      }

      const existingUser = await this.userRepository.findOne({
        where: { id: createdByUserId },
      });
      if (!existingUser) {
        this.logger.error(`User with ID ${createdByUserId} does not exist`);
        return PROPERTY_IMAGES_RESPONSES.USER_NOT_FOUND(createdByUserId);
      }

      const spaceTypeIds = createPropertyImagesDtos.map(
        (dto) => dto.spaceType.id,
      );

      const existingSpaceTypes = await this.spaceTypesRepository.find({
        where: { id: In(spaceTypeIds) },
        relations: ['space'],
      });

      const validSpaceTypeIds = new Set(existingSpaceTypes.map((st) => st.id));

      const invalidSpaceTypeIds = spaceTypeIds.filter(
        (id) => !validSpaceTypeIds.has(id),
      );

      if (invalidSpaceTypeIds.length > 0) {
        this.logger.error(
          `Invalid Space Type IDs: ${invalidSpaceTypeIds.join(', ')}`,
        );
        return PROPERTY_IMAGES_RESPONSES.MULTIPLE_SPACE_TYPES_NOT_FOUND(
          invalidSpaceTypeIds,
        );
      }

      const uploadPromises = createPropertyImagesDtos.map(async (dto) => {
        const existingSpaceType = await this.spaceTypesRepository.findOne({
          where: { id: dto.spaceType.id },
          relations: ['space'],
        });

        const folderName = `properties_media/${existingProperty.propertyName}/images/${existingSpaceType.space.name}`;
        const fileName = dto.imageFiles.originalname;

        const imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          dto.imageFiles.buffer,
          dto.imageFiles.mimetype,
        );

        const newImage = this.propertyImagesRepository.create({
          property: dto.property,
          createdBy: dto.createdBy,
          imageName: dto.name,
          spaceType: dto.spaceType,
          imageUrl: imageUrlLocation,
        });

        const savedImage = await this.propertyImagesRepository.save(newImage);
        return savedImage;
      });

      const uploadedImages = await Promise.all(uploadPromises);

      this.logger.log(
        `${uploadedImages.length} property images created successfully`,
      );
      return PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGES_CREATED(
        uploadedImages.length,
      );
    } catch (error) {
      this.logger.error(
        `Error creating property images: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the property images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllPropertyImages(): Promise<{
    success: boolean;
    message: string;
    data?: PropertyImages[];
    statusCode: number;
  }> {
    try {
      const propertyImages = await this.propertyImagesRepository.find({
        relations: [
          'spaceType',
          'spaceType.space',
          'property',
          'createdBy',
          'updatedBy',
        ],
        select: {
          spaceType: {
            id: true,
            name: true,
            space: {
              id: true,
              name: true,
            },
          },
          property: {
            id: true,
            propertyName: true,
          },
          createdBy: {
            id: true,
          },
          updatedBy: {
            id: true,
          },
        },
      });

      if (propertyImages.length === 0) {
        this.logger.log(`No property images are found`);
        return PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGES_NOT_FOUND();
      }

      this.logger.log(`Retrieved ${propertyImages.length} property images`);
      return PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGES_FETCHED(propertyImages);
    } catch (error) {
      this.logger.error(
        `Error retrieving property images: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all property images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPropertyImageById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertyImages;
    statusCode: number;
  }> {
    try {
      const propertyImage = await this.propertyImagesRepository.findOne({
        relations: [
          'spaceType',
          'spaceType.space',
          'property',
          'createdBy',
          'updatedBy',
        ],
        select: {
          spaceType: {
            id: true,
            name: true,
            space: {
              id: true,
              name: true,
            },
          },
          property: {
            id: true,
            propertyName: true,
          },
          createdBy: {
            id: true,
          },
          updatedBy: {
            id: true,
          },
        },
        where: { id },
      });

      if (!propertyImage) {
        this.logger.error(`Property Image with ID ${id} not found`);
        return PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGE_NOT_FOUND(id);
      }
      this.logger.log(`Property Image with ID ${id} retrieved successfully`);
      return PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGE_FETCHED(propertyImage);
    } catch (error) {
      this.logger.error(
        `Error retrieving property image with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the property image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePropertyImageById(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const propertyImage = await this.propertyImagesRepository.findOne({
        where: { id },
      });

      if (!propertyImage) {
        return PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGE_NOT_FOUND(id);
      }

      const s3Key = await this.s3UtilsService.extractS3Key(
        propertyImage.imageUrl,
      );

      const headObject =
        await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
      if (!headObject) {
        return PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGE_NOT_FOUND_IN_AWS_S3(
          s3Key,
        );
      }

      await this.s3UtilsService.deleteObjectFromS3(s3Key);

      const result = await this.propertyImagesRepository.delete(id);
      if (result.affected === 0) {
        return PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGE_NOT_FOUND(id);
      }
      return PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGE_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting property image with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
