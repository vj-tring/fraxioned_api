import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpaceBedType } from '../entities/space-bed-type.entity';
import { CreateSpaceBedTypeDto } from '../dto/requests/space-bed-type/create-space-bed-type.dto';
import { ApiResponse } from '../commons/response-body/common.responses';
import { SPACE_BED_TYPE_RESPONSES } from '../commons/constants/response-constants/space-bed-type.constant';
import { UpdateSpaceBedTypeDto } from '../dto/requests/space-bed-type/update-space-bed-type.dto';
import { UserService } from './user.service';
import { S3 } from 'aws-sdk';
import { S3UtilsService } from './s3-utils.service';
import { MEDIA_IMAGE_RESPONSES } from '../commons/constants/response-constants/media-image.constant';

@Injectable()
export class SpaceBedTypeService {
  private readonly s3 = new S3();
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME;

  constructor(
    @InjectRepository(SpaceBedType)
    private readonly spaceBedTypeRepository: Repository<SpaceBedType>,
    private readonly logger: LoggerService,
    private readonly userService: UserService,
    private readonly s3UtilsService: S3UtilsService,
  ) {}

  async findSpaceBedTypeByName(bedType: string): Promise<SpaceBedType | null> {
    return await this.spaceBedTypeRepository.findOne({
      where: { bedType },
    });
  }
  async handleSpaceBedTypeNotFound(id: number): Promise<ApiResponse<null>> {
    this.logger.error(`Space bed type with ID ${id} not found`);
    return SPACE_BED_TYPE_RESPONSES.SPACE_BED_TYPE_NOT_FOUND(id);
  }
  private async checkSpaceBedTypeExists(
    bedType: string,
    id?: number,
  ): Promise<ApiResponse<SpaceBedType> | null> {
    const existingSpaceBedType = await this.findSpaceBedTypeByName(bedType);
    if (existingSpaceBedType && (!id || existingSpaceBedType.id !== id)) {
      this.logger.error(`Error: Space bed type '${bedType}' already exists`);
      return SPACE_BED_TYPE_RESPONSES.SPACE_BED_TYPE_ALREADY_EXISTS(bedType);
    }
    return null;
  }

  async findAllSpaceBedTypes(): Promise<SpaceBedType[] | null> {
    return await this.spaceBedTypeRepository.find({
      relations: ['createdBy', 'updatedBy'],
      select: {
        createdBy: {
          id: true,
        },
        updatedBy: {
          id: true,
        },
      },
    });
  }

  async findSpaceBedTypeById(id: number): Promise<SpaceBedType | null> {
    return await this.spaceBedTypeRepository.findOne({
      relations: ['createdBy', 'updatedBy'],
      select: {
        createdBy: {
          id: true,
        },
        updatedBy: {
          id: true,
        },
      },
      where: { id },
    });
  }

  async createSpaceBedType(
    createSpaceBedTypeDto: CreateSpaceBedTypeDto,
    imageFile?: Express.Multer.File,
  ): Promise<ApiResponse<SpaceBedType>> {
    try {
      const existingResponse = await this.checkSpaceBedTypeExists(
        createSpaceBedTypeDto.bedType,
      );
      if (existingResponse) {
        return existingResponse;
      }

      const existingUser = await this.userService.findUserById(
        createSpaceBedTypeDto.createdBy.id,
      );
      if (!existingUser) {
        this.logger.error(
          `User with ID ${createSpaceBedTypeDto.createdBy.id} does not exist`,
        );
        return this.userService.handleUserNotFound(
          createSpaceBedTypeDto.createdBy.id,
        );
      }

      const spaceBedType = this.spaceBedTypeRepository.create({
        ...createSpaceBedTypeDto,
      });
      const savedSpaceBedType =
        await this.spaceBedTypeRepository.save(spaceBedType);

      if (imageFile) {
        const folderName = 'general_media/images/space_bedroom_types';
        const fileExtension = imageFile.originalname.split('.').pop();
        const fileName = `${savedSpaceBedType.id}.${fileExtension}`;

        const imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          imageFile.buffer,
          imageFile.mimetype,
        );

        savedSpaceBedType.s3_url = imageUrlLocation;

        await this.spaceBedTypeRepository.save(savedSpaceBedType);
      }

      this.logger.log(
        `Space bed type '${createSpaceBedTypeDto.bedType}' created with ID ${savedSpaceBedType.id}`,
      );
      return SPACE_BED_TYPE_RESPONSES.SPACE_BED_TYPE_CREATED(savedSpaceBedType);
    } catch (error) {
      this.logger.error(
        `Error creating space bed type: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the space bed type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllSpaceBedTypes(): Promise<ApiResponse<SpaceBedType[]>> {
    try {
      const existingSpaceBedTypes = await this.findAllSpaceBedTypes();

      if (existingSpaceBedTypes.length === 0) {
        this.logger.log(`No space bed types are available`);
        return SPACE_BED_TYPE_RESPONSES.SPACE_BED_TYPES_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${existingSpaceBedTypes.length} space bed types successfully.`,
      );
      return SPACE_BED_TYPE_RESPONSES.SPACE_BED_TYPES_FETCHED(
        existingSpaceBedTypes,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving space bed types: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all space bed types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSpaceBedTypeById(id: number): Promise<ApiResponse<SpaceBedType>> {
    try {
      const existingSpaceBedType = await this.findSpaceBedTypeById(id);

      if (!existingSpaceBedType) {
        return this.handleSpaceBedTypeNotFound(id);
      }

      this.logger.log(`Space bed type with ID ${id} retrieved successfully`);
      return SPACE_BED_TYPE_RESPONSES.SPACE_BED_TYPE_FETCHED(
        existingSpaceBedType,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving space bed type with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the space bed type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateSpaceBedTypeById(
    id: number,
    updateSpaceBedTypeDto: UpdateSpaceBedTypeDto,
    imageFile?: Express.Multer.File,
  ): Promise<ApiResponse<SpaceBedType>> {
    try {
      const existingSpaceBedType = await this.findSpaceBedTypeById(id);

      if (!existingSpaceBedType) {
        return this.handleSpaceBedTypeNotFound(id);
      }

      if (updateSpaceBedTypeDto.bedType) {
        const existingResponse = await this.checkSpaceBedTypeExists(
          updateSpaceBedTypeDto.bedType,
          id,
        );
        if (existingResponse) {
          return existingResponse;
        }
      }

      const existingUser = await this.userService.findUserById(
        updateSpaceBedTypeDto.updatedBy.id,
      );
      if (!existingUser) {
        this.logger.error(
          `User with ID ${updateSpaceBedTypeDto.updatedBy.id} does not exist`,
        );
        return this.userService.handleUserNotFound(
          updateSpaceBedTypeDto.updatedBy.id,
        );
      }

      Object.assign(existingSpaceBedType, updateSpaceBedTypeDto);

      if (imageFile) {
        const folderName = 'general_media/images/space_bedroom_types';
        const fileExtension = imageFile.originalname.split('.').pop();
        const fileName = `${existingSpaceBedType.id}.${fileExtension}`;
        let s3Key = '';
        let imageUrlLocation = existingSpaceBedType.s3_url;

        if (imageUrlLocation) {
          s3Key = await this.s3UtilsService.extractS3Key(imageUrlLocation);
        }

        if (s3Key) {
          if (decodeURIComponent(s3Key) != folderName + '/' + fileName) {
            const headObject =
              await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
            if (!headObject) {
              return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGE_NOT_FOUND_IN_AWS_S3(
                s3Key,
              );
            }
            await this.s3UtilsService.deleteObjectFromS3(s3Key);
          }
        }

        imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          imageFile.buffer,
          imageFile.mimetype,
        );

        existingSpaceBedType.s3_url = imageUrlLocation;
      }

      const updatedSpaceBedType =
        await this.spaceBedTypeRepository.save(existingSpaceBedType);
      this.logger.log(`Space bed type with ID ${id} updated successfully`);
      return SPACE_BED_TYPE_RESPONSES.SPACE_BED_TYPE_UPDATED(
        updatedSpaceBedType,
      );
    } catch (error) {
      this.logger.error(
        `Error updating space bed type with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the space bed type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteSpaceBedTypeById(id: number): Promise<ApiResponse<SpaceBedType>> {
    try {
      const existingSpaceBedroomType = await this.findSpaceBedTypeById(id);
      if (!existingSpaceBedroomType) {
        this.logger.error(`Space bed type with ID ${id} not found`);
        return SPACE_BED_TYPE_RESPONSES.SPACE_BED_TYPE_NOT_FOUND(id);
      }

      const s3Key = await this.s3UtilsService.extractS3Key(
        existingSpaceBedroomType.s3_url,
      );

      const headObject =
        await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
      if (!headObject) {
        return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGE_NOT_FOUND_IN_AWS_S3(s3Key);
      }

      await this.s3UtilsService.deleteObjectFromS3(s3Key);
      await this.spaceBedTypeRepository.remove(existingSpaceBedroomType);

      this.logger.log(`Space bed type with ID ${id} deleted successfully`);
      return SPACE_BED_TYPE_RESPONSES.SPACE_BED_TYPE_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting space bed type with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the space bed type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
