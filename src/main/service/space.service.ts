import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { Space } from '../entities/space.entity';
import { CreateSpaceDto } from '../dto/requests/space/create-space.dto';
import { UpdateSpaceDto } from '../dto/requests/space/update-space.dto';
import { ApiResponse } from '../commons/response-body/common.responses';
import { S3UtilsService } from './s3-utils.service';
import { SpaceRepository } from '../repository/space.repository';
import { UserRepository } from '../repository/user.repository';
import { UserResponseHandler } from '../response-handler/user-response-handler';
import { SpaceResponseHandler } from '../response-handler/space-response-handler';
import { PropertySpaceRepository } from '../repository/property-space.repository';

@Injectable()
export class SpaceService {
  constructor(
    private readonly s3UtilsService: S3UtilsService,
    private readonly logger: LoggerService,
    private readonly spaceRepository: SpaceRepository,
    private readonly userRepository: UserRepository,
    private readonly propertySpaceRepository: PropertySpaceRepository,
    private readonly userResponseHandler: UserResponseHandler,
    private readonly spaceResponseHandler: SpaceResponseHandler,
  ) {}

  async createSpace(
    createSpaceDto: CreateSpaceDto,
    imageFile: Express.Multer.File,
  ): Promise<ApiResponse<Space>> {
    try {
      const existingSpace = await this.spaceRepository.findSpaceByName(
        createSpaceDto.name,
      );
      if (existingSpace) {
        return await this.spaceResponseHandler.handleExistingSpace(
          createSpaceDto.name,
        );
      }

      const existingUser = await this.userRepository.findUserById(
        createSpaceDto.createdBy.id,
      );
      if (!existingUser) {
        return await this.userResponseHandler.handleUserNotFound();
      }

      const space = await this.spaceRepository.createSpace({
        ...createSpaceDto,
      });
      const savedSpace = await this.spaceRepository.saveSpace(space);

      const folderName = 'general_media/images/space';
      const fileExtension = imageFile.originalname.split('.').pop();
      const fileName = `${savedSpace.id}.${fileExtension}`;

      const imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
        folderName,
        fileName,
        imageFile.buffer,
        imageFile.mimetype,
      );

      savedSpace.s3_url = imageUrlLocation;

      await this.spaceRepository.saveSpace(savedSpace);
      return await this.spaceResponseHandler.handleSpaceCreated(savedSpace);
    } catch (error) {
      this.logger.error(
        `Error creating space: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllSpaces(): Promise<ApiResponse<Space[]>> {
    try {
      const existingSpaces = await this.spaceRepository.findAllSpaces();
      if (existingSpaces.length === 0) {
        return await this.spaceResponseHandler.handleNoSpacesAvailable();
      }
      return await this.spaceResponseHandler.handleSpacesFetched(
        existingSpaces,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving spaces: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the spaces',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSpaceById(id: number): Promise<ApiResponse<Space>> {
    try {
      const existingSpace = await this.spaceRepository.findSpaceById(id);
      if (!existingSpace) {
        return await this.spaceResponseHandler.handleSpaceNotFound();
      }
      return await this.spaceResponseHandler.handleSpaceFetched(existingSpace);
    } catch (error) {
      this.logger.error(
        `Error retrieving space with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateSpaceDetailById(
    id: number,
    updateSpaceDto: UpdateSpaceDto,
    imageFile?: Express.Multer.File,
  ): Promise<ApiResponse<Space>> {
    try {
      const existingSpace = await this.spaceRepository.findSpaceById(id);
      if (!existingSpace) {
        return await this.spaceResponseHandler.handleSpaceNotFound();
      }

      const existingSpaceName =
        await this.spaceRepository.findSpaceByNameExcludingId(
          updateSpaceDto.name,
          id,
        );
      if (existingSpaceName) {
        return await this.spaceResponseHandler.handleExistingSpace(
          updateSpaceDto.name,
        );
      }

      const existingUser = await this.userRepository.findUserById(
        updateSpaceDto.updatedBy.id,
      );
      if (!existingUser) {
        return await this.userResponseHandler.handleUserNotFound();
      }

      Object.assign(existingSpace, updateSpaceDto);

      let imageUrlLocation = await this.s3UtilsService.handleS3KeyAndImageUrl(
        existingSpace.s3_url,
        !!imageFile,
      );

      if (imageFile) {
        const folderName = 'general_media/images/space';
        const fileExtension = imageFile.originalname.split('.').pop();
        const fileName = `${existingSpace.id}.${fileExtension}`;
        imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          imageFile.buffer,
          imageFile.mimetype,
        );
      }
      existingSpace.s3_url = imageUrlLocation;

      const updatedSpace = await this.spaceRepository.saveSpace(existingSpace);

      return await this.spaceResponseHandler.handleSpaceUpdated(updatedSpace);
    } catch (error) {
      this.logger.error(
        `Error updating space with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteSpaceById(id: number): Promise<ApiResponse<Space>> {
    try {
      const existingSpace = await this.spaceRepository.findSpaceById(id);
      if (!existingSpace) {
        return await this.spaceResponseHandler.handleSpaceNotFound();
      }

      const existingPropertySpace =
        await this.propertySpaceRepository.findPropertySpaceBySpaceId(id);
      if (existingPropertySpace) {
        return await this.spaceResponseHandler.handleSpaceForeignKeyConflict(
          existingSpace.name,
        );
      }

      await this.s3UtilsService.handleS3KeyAndImageUrl(
        existingSpace.s3_url,
        true,
      );

      await this.spaceRepository.deleteSpace(id);
      return await this.spaceResponseHandler.handleSpaceDeleted(
        existingSpace.name,
      );
    } catch (error) {
      this.logger.error(
        `Error deleting space with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
