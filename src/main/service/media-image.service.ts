import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaImage } from '../entities/media-image.entity';
import { CreateMediaImageDto } from '../dto/requests/media-image/create.dto';
import { UpdateMediaImageDto } from '../dto/requests/media-image/update.dto';
import { LoggerService } from './logger.service';
import { MEDIA_IMAGE_RESPONSES } from '../commons/constants/response-constants/media-image.constant';
import { S3UtilsService } from '../service/s3-utils.service';
import { Property } from '../entities/property.entity';
import { Amenities } from '../entities/amenities.entity';
import { PropertySpace } from '../entities/property-space.entity';
import { SpaceBathroomTypes } from '../entities/space-bathroom-types.entity';
import { SpaceBedType } from '../entities/space-bed-type.entity';
import { Space } from '../entities/space.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class MediaImageService {
  constructor(
    @InjectRepository(MediaImage)
    private readonly mediaImageRepository: Repository<MediaImage>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Amenities)
    private readonly amenitiesRepository: Repository<Amenities>,
    @InjectRepository(PropertySpace)
    private readonly propertySpaceRepository: Repository<PropertySpace>,
    @InjectRepository(SpaceBathroomTypes)
    private readonly spaceBathroomTypesRepository: Repository<SpaceBathroomTypes>,
    @InjectRepository(SpaceBedType)
    private readonly spaceBedTypeRepository: Repository<SpaceBedType>,
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly s3UtilsService: S3UtilsService,
    private readonly logger: LoggerService,
  ) {}

  async createMediaImages(
    createMediaImageDtos: CreateMediaImageDto[],
  ): Promise<{
    success: boolean;
    message: string;
    data?: MediaImage[];
    statusCode: number;
  }> {
    try {
      const propertyId = createMediaImageDtos[0].property?.id;
      const createdByUserId = createMediaImageDtos[0].createdBy.id;

      const existingProperty = propertyId
        ? await this.propertyRepository.findOne({
            where: { id: propertyId },
          })
        : null;

      if (propertyId && !existingProperty) {
        this.logger.error(`Property with ID ${propertyId} does not exist`);
        return MEDIA_IMAGE_RESPONSES.ENTITY_NOT_FOUND('Property', propertyId);
      }

      const existingUser = await this.userRepository.findOne({
        where: { id: createdByUserId },
      });
      if (!existingUser) {
        this.logger.error(`User with ID ${createdByUserId} does not exist`);
        return MEDIA_IMAGE_RESPONSES.ENTITY_NOT_FOUND('User', createdByUserId);
      }

      const uploadPromises = createMediaImageDtos.map(async (dto, index) => {
        const entities = [
          {
            repo: this.propertyRepository,
            entity: dto.property,
            name: 'Property',
          },
          {
            repo: this.amenitiesRepository,
            entity: dto.amenities,
            name: 'Amenities',
          },
          {
            repo: this.propertySpaceRepository,
            entity: dto.propertySpace,
            name: 'Property Space',
          },
          {
            repo: this.spaceBathroomTypesRepository,
            entity: dto.spaceBathroomType,
            name: 'Space Bathroom Type',
          },
          {
            repo: this.spaceBedTypeRepository,
            entity: dto.spaceBedType,
            name: 'Space Bed Type',
          },
          { repo: this.spaceRepository, entity: dto.space, name: 'Space' },
          { repo: this.userRepository, entity: dto.user, name: 'User' },
          {
            repo: this.userRepository,
            entity: dto.createdBy,
            name: 'Created By User',
          },
        ];

        for (const { repo, entity, name } of entities) {
          if (entity && !(await repo.findOne({ where: { id: entity.id } }))) {
            throw new HttpException(
              MEDIA_IMAGE_RESPONSES.ENTITY_NOT_FOUND(name, entity.id),
              HttpStatus.NOT_FOUND,
            );
          }
        }

        let folderName = 'media_images';
        let entityId: string;
        if (dto.property) {
          folderName += `/property_${dto.property.id}`;
          entityId = `property_${dto.property.id}`;
        } else if (dto.amenities) {
          folderName += `/amenity_${dto.amenities.id}`;
          entityId = `amenity_${dto.amenities.id}`;
        } else if (dto.propertySpace) {
          folderName += `/property_space_${dto.propertySpace.id}`;
          entityId = `property_space_${dto.propertySpace.id}`;
        } else if (dto.spaceBathroomType) {
          folderName += `/bathroom_type_${dto.spaceBathroomType.id}`;
          entityId = `bathroom_type_${dto.spaceBathroomType.id}`;
        } else if (dto.spaceBedType) {
          folderName += `/bed_type_${dto.spaceBedType.id}`;
          entityId = `bed_type_${dto.spaceBedType.id}`;
        } else if (dto.space) {
          folderName += `/space_${dto.space.id}`;
          entityId = `space_${dto.space.id}`;
        } else {
          folderName += '/general';
          entityId = 'general';
        }

        const fileExtension = dto.imageFile.originalname.split('.').pop();
        const fileName = `${entityId}_${Date.now()}_${index}.${fileExtension}`;

        const imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          dto.imageFile.buffer,
          dto.imageFile.mimetype,
        );

        const newImage = this.mediaImageRepository.create({
          ...dto,
          url: imageUrlLocation,
          createdBy: existingUser,
        });

        return await this.mediaImageRepository.save(newImage);
      });

      const savedImages = await Promise.all(uploadPromises);

      this.logger.log(
        `${savedImages.length} media images created successfully`,
      );
      return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGES_CREATED(savedImages);
    } catch (error) {
      this.logger.error(
        `Error creating media images: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        `An error occurred while creating the media images`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllMediaImages(): Promise<{
    success: boolean;
    message: string;
    data?: MediaImage[];
    statusCode: number;
  }> {
    try {
      const mediaImages = await this.mediaImageRepository.find({
        relations: [
          'amenities',
          'property',
          'propertySpace',
          'spaceBathroomType',
          'spaceBedType',
          'space',
          'user',
          'createdBy',
          'updatedBy',
        ],
      });

      if (mediaImages.length === 0) {
        this.logger.log(`No media images are found`);
        return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGES_NOT_FOUND();
      }

      this.logger.log(`Retrieved ${mediaImages.length} media images`);
      return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGES_FETCHED(mediaImages);
    } catch (error) {
      this.logger.error(
        `Error retrieving media images: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all media images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findMediaImageById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: MediaImage;
    statusCode: number;
  }> {
    try {
      const mediaImage = await this.mediaImageRepository.findOne({
        where: { id },
        relations: [
          'amenities',
          'property',
          'propertySpace',
          'spaceBathroomType',
          'spaceBedType',
          'space',
          'user',
          'createdBy',
          'updatedBy',
        ],
      });

      if (!mediaImage) {
        this.logger.error(`Media Image with ID ${id} not found`);
        return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGE_NOT_FOUND(id);
      }
      this.logger.log(`Media Image with ID ${id} retrieved successfully`);
      return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGE_FETCHED(mediaImage);
    } catch (error) {
      this.logger.error(
        `Error retrieving media image with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the media image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateMediaImage(
    id: number,
    updateMediaImageDto: UpdateMediaImageDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: MediaImage;
    statusCode: number;
  }> {
    try {
      const mediaImage = await this.mediaImageRepository.findOne({
        where: { id },
        relations: [
          'amenities',
          'property',
          'propertySpace',
          'spaceBathroomType',
          'spaceBedType',
          'space',
          'user',
          'createdBy',
          'updatedBy',
        ],
      });

      if (!mediaImage) {
        this.logger.error(`Media Image with ID ${id} not found`);
        return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGE_NOT_FOUND(id);
      }

      const entities = [
        {
          repo: this.propertyRepository,
          entity: updateMediaImageDto.property,
          name: 'Property',
        },
        {
          repo: this.amenitiesRepository,
          entity: updateMediaImageDto.amenities,
          name: 'Amenities',
        },
        {
          repo: this.propertySpaceRepository,
          entity: updateMediaImageDto.propertySpace,
          name: 'Property Space',
        },
        {
          repo: this.spaceBathroomTypesRepository,
          entity: updateMediaImageDto.spaceBathroomType,
          name: 'Space Bathroom Type',
        },
        {
          repo: this.spaceBedTypeRepository,
          entity: updateMediaImageDto.spaceBedType,
          name: 'Space Bed Type',
        },
        {
          repo: this.spaceRepository,
          entity: updateMediaImageDto.space,
          name: 'Space',
        },
        {
          repo: this.userRepository,
          entity: updateMediaImageDto.user,
          name: 'User',
        },
        {
          repo: this.userRepository,
          entity: updateMediaImageDto.updatedBy,
          name: 'Updated By User',
        },
      ];

      for (const { repo, entity, name } of entities) {
        if (entity && !(await repo.findOne({ where: { id: entity.id } }))) {
          return MEDIA_IMAGE_RESPONSES.ENTITY_NOT_FOUND(name, entity.id);
        }
      }

      let imageUrlLocation = mediaImage.url;

      if (updateMediaImageDto.imageFile) {
        const folderName = `media_images/${updateMediaImageDto.property?.id || 'general'}`;
        const fileName = updateMediaImageDto.imageFile.originalname;

        const s3Key = await this.s3UtilsService.extractS3Key(mediaImage.url);

        if (decodeURIComponent(s3Key) != folderName + '/' + fileName) {
          const headObject =
            await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
          if (!headObject) {
            return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGE_NOT_FOUND_IN_AWS_S3(s3Key);
          }

          await this.s3UtilsService.deleteObjectFromS3(s3Key);

          imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
            folderName,
            fileName,
            updateMediaImageDto.imageFile.buffer,
            updateMediaImageDto.imageFile.mimetype,
          );
        }
      }

      Object.assign(mediaImage, {
        ...updateMediaImageDto,
        url: imageUrlLocation,
      });

      const updatedImage = await this.mediaImageRepository.save(mediaImage);

      this.logger.log(`Media Image with ID ${id} updated successfully`);
      return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGE_UPDATED(updatedImage, id);
    } catch (error) {
      this.logger.error(
        `Error updating media image with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the media image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteMediaImageById(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const mediaImage = await this.mediaImageRepository.findOne({
        where: { id },
      });

      if (!mediaImage) {
        return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGE_NOT_FOUND(id);
      }

      const s3Key = await this.s3UtilsService.extractS3Key(mediaImage.url);

      const headObject =
        await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
      if (!headObject) {
        return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGE_NOT_FOUND_IN_AWS_S3(s3Key);
      }

      await this.s3UtilsService.deleteObjectFromS3(s3Key);

      const result = await this.mediaImageRepository.delete(id);
      if (result.affected === 0) {
        return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGE_NOT_FOUND(id);
      }
      return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGE_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting media image with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the media image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
