import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Space } from '../entities/space.entity';
import { SPACE_RESPONSES } from '../commons/constants/response-constants/space.constant';
import { CreateSpaceDto } from '../dto/requests/space/create-space.dto';
import { UpdateSpaceDto } from '../dto/requests/space/update-space.dto';
import { ApiResponse } from '../commons/response-body/common.responses';
import { UserService } from './user.service';
import { PropertySpaceService } from './property-space.service';
import { S3UtilsService } from './s3-utils.service';
import { S3 } from 'aws-sdk';

@Injectable()
export class SpaceService {
  private readonly s3 = new S3();
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME;

  constructor(
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => PropertySpaceService))
    private readonly propertySpaceService: PropertySpaceService,
    private readonly s3UtilsService: S3UtilsService,
    private readonly logger: LoggerService,
  ) {}

  async findSpaceByName(name: string): Promise<Space | null> {
    return await this.spaceRepository.findOne({
      where: { name },
    });
  }

  async saveSpace(space: Space): Promise<Space | null> {
    return await this.spaceRepository.save(space);
  }

  async findAllSpaces(): Promise<Space[] | null> {
    return await this.spaceRepository.find({
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

  async findSpaceById(id: number): Promise<Space | null> {
    return await this.spaceRepository.findOne({
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

  async findSpaceByNameExcludingId(
    name: string,
    id: number,
  ): Promise<Space | null> {
    return await this.spaceRepository.findOne({
      where: { name, id: Not(id) },
    });
  }

  async handleExistingSpace(name: string): Promise<ApiResponse<Space>> {
    this.logger.error(`Space with name ${name} already exists`);
    return SPACE_RESPONSES.SPACE_ALREADY_EXISTS(name);
  }

  async handleSpaceNotFound(): Promise<ApiResponse<null>> {
    this.logger.error(`Space not found`);
    return SPACE_RESPONSES.SPACE_NOT_FOUND();
  }

  async createSpace(
    createSpaceDto: CreateSpaceDto,
    imageFile: Express.Multer.File,
  ): Promise<ApiResponse<Space>> {
    try {
      const existingSpace = await this.findSpaceByName(createSpaceDto.name);
      if (existingSpace) {
        return await this.handleExistingSpace(createSpaceDto.name);
      }

      const existingUser = await this.userService.findUserById(
        createSpaceDto.createdBy.id,
      );
      if (!existingUser) {
        return await this.userService.handleUserNotFound(
          createSpaceDto.createdBy.id,
        );
      }

      const space = this.spaceRepository.create({
        ...createSpaceDto,
      });
      const savedSpace = await this.saveSpace(space);

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

      await this.spaceRepository.save(savedSpace);

      this.logger.log(`Space ${savedSpace.name} created successfully`);
      return SPACE_RESPONSES.SPACE_CREATED(savedSpace);
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
      const existingSpaces = await this.findAllSpaces();

      if (existingSpaces.length === 0) {
        this.logger.log(`No spaces are available`);
        return SPACE_RESPONSES.SPACES_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${existingSpaces.length} spaces successfully.`,
      );
      return SPACE_RESPONSES.SPACES_FETCHED(existingSpaces);
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
      const existingSpace = await this.findSpaceById(id);

      if (!existingSpace) {
        return await this.handleSpaceNotFound();
      }

      this.logger.log(`Space ${existingSpace.name} retrieved successfully`);
      return SPACE_RESPONSES.SPACE_FETCHED(existingSpace);
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
      const existingSpace = await this.findSpaceById(id);
      if (!existingSpace) {
        return await this.handleSpaceNotFound();
      }

      const existingSpaceName = await this.findSpaceByNameExcludingId(
        updateSpaceDto.name,
        id,
      );
      if (existingSpaceName) {
        return await this.handleExistingSpace(updateSpaceDto.name);
      }

      const existingUser = await this.userService.findUserById(
        updateSpaceDto.updatedBy.id,
      );
      if (!existingUser) {
        return await this.userService.handleUserNotFound(
          updateSpaceDto.updatedBy.id,
        );
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
      const updatedSpace = await this.saveSpace(existingSpace);

      this.logger.log(`Space ${updatedSpace.name} updated successfully`);
      return SPACE_RESPONSES.SPACE_UPDATED(updatedSpace);
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
      const existingSpace = await this.findSpaceById(id);
      if (!existingSpace) {
        return await this.handleSpaceNotFound();
      }

      const existingPropertySpace =
        await this.propertySpaceService.findPropertySpaceBySpaceId(id);
      if (existingPropertySpace) {
        this.logger.log(
          `Space ${existingSpace.name} exists and is mapped to property, hence cannot be deleted.`,
        );
        return SPACE_RESPONSES.SPACE_FOREIGN_KEY_CONFLICT(existingSpace.name);
      }

      await this.s3UtilsService.handleS3KeyAndImageUrl(
        existingSpace.s3_url,
        true,
      );

      await this.spaceRepository.delete(id);

      this.logger.log(`Space ${existingSpace.name} deleted successfully`);
      return SPACE_RESPONSES.SPACE_DELETED(existingSpace.name);
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
