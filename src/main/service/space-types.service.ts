import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerService } from './logger.service';
import { SpaceTypes } from '../entities/space-types.entity';
import { SPACE_TYPES_RESPONSES } from '../commons/constants/response-constants/space-types.constant';
import { CreateSpaceTypeDto } from '../dto/requests/space-types/create-space-types.dto';
import { Space } from '../entities/space.entity';
import { User } from '../entities/user.entity';
import { SPACE_RESPONSES } from '../commons/constants/response-constants/space.constant';
import { UpdateSpaceTypeDto } from '../dto/requests/space-types/update-space-types.dto';

@Injectable()
export class SpaceTypesService {
  constructor(
    @InjectRepository(SpaceTypes)
    private readonly spaceTypesRepository: Repository<SpaceTypes>,
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly logger: LoggerService,
  ) {}

  async createSpaceType(createSpaceTypeDto: CreateSpaceTypeDto): Promise<{
    success: boolean;
    message: string;
    data?: SpaceTypes;
    statusCode: number;
  }> {
    try {
      this.logger.log(
        `Creating space type ${createSpaceTypeDto.name} to the space ${createSpaceTypeDto.space.id}`,
      );

      const existingSpace = await this.spaceRepository.findOne({
        where: {
          id: createSpaceTypeDto.space.id,
        },
      });
      if (!existingSpace) {
        this.logger.error(
          `Space with ID ${createSpaceTypeDto.space.id} does not exist`,
        );
        return SPACE_TYPES_RESPONSES.SPACE_NOT_FOUND(
          createSpaceTypeDto.space.id,
        );
      }

      const user = await this.usersRepository.findOne({
        where: {
          id: createSpaceTypeDto.createdBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${createSpaceTypeDto.createdBy.id} does not exist`,
        );
        return SPACE_RESPONSES.USER_NOT_FOUND(createSpaceTypeDto.createdBy.id);
      }

      const existingSpaceType = await this.spaceTypesRepository.findOne({
        where: {
          name: createSpaceTypeDto.name,
          space: {
            id: createSpaceTypeDto.space.id,
          },
        },
      });

      if (existingSpaceType) {
        this.logger.error(
          `Error creating space type: Space Type ${createSpaceTypeDto.name} with Space ID ${createSpaceTypeDto.space.id} already exists`,
        );
        return SPACE_TYPES_RESPONSES.SPACE_TYPE_ALREADY_EXISTS(
          createSpaceTypeDto.name,
          createSpaceTypeDto.space.id,
        );
      }

      const spaceType = this.spaceTypesRepository.create({
        ...createSpaceTypeDto,
      });
      const savedSpaceType = await this.spaceTypesRepository.save(spaceType);
      this.logger.log(
        `Space Type ${createSpaceTypeDto.name} for space ID ${createSpaceTypeDto.space.id} created successfully`,
      );
      return SPACE_TYPES_RESPONSES.SPACE_TYPE_CREATED(
        createSpaceTypeDto.name,
        createSpaceTypeDto.space.id,
        savedSpaceType,
      );
    } catch (error) {
      this.logger.error(
        `Error creating space type: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the space type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllSpaceTypes(): Promise<{
    success: boolean;
    message: string;
    data?: SpaceTypes[];
    statusCode: number;
  }> {
    try {
      const spaceTypes = await this.spaceTypesRepository.find({
        relations: ['space', 'createdBy', 'updatedBy'],
        select: {
          space: {
            id: true,
            name: true,
          },
          createdBy: {
            id: true,
          },
          updatedBy: {
            id: true,
          },
        },
      });

      if (spaceTypes.length === 0) {
        this.logger.log(`No space types are available`);

        return SPACE_TYPES_RESPONSES.SPACE_TYPES_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${spaceTypes.length} space types successfully.`,
      );

      return SPACE_TYPES_RESPONSES.SPACE_TYPES_FETCHED(spaceTypes);
    } catch (error) {
      this.logger.error(
        `Error retrieving space types: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all space types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findSpaceTypeById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: SpaceTypes;
    statusCode: number;
  }> {
    try {
      const spaceType = await this.spaceTypesRepository.findOne({
        relations: ['space', 'createdBy', 'updatedBy'],
        select: {
          space: {
            id: true,
            name: true,
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

      if (!spaceType) {
        this.logger.error(`Space Type with ID ${id} not found`);
        return SPACE_TYPES_RESPONSES.SPACE_TYPE_NOT_FOUND(id);
      }
      this.logger.log(`Space Type with ID ${id} retrieved successfully`);
      return SPACE_TYPES_RESPONSES.SPACE_TYPE_FETCHED(spaceType, id);
    } catch (error) {
      this.logger.error(
        `Error retrieving space type with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the space type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateSpaceType(
    id: number,
    updateSpaceTypeDto: UpdateSpaceTypeDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: SpaceTypes;
    statusCode: number;
  }> {
    try {
      const spaceType = await this.spaceTypesRepository.findOne({
        relations: ['space', 'createdBy', 'updatedBy'],
        select: {
          space: {
            id: true,
            name: true,
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

      if (!spaceType) {
        this.logger.error(`Space Type with ID ${id} does not exist`);
        return SPACE_TYPES_RESPONSES.SPACE_TYPE_NOT_FOUND(id);
      }

      const user = await this.usersRepository.findOne({
        where: {
          id: updateSpaceTypeDto.updatedBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${updateSpaceTypeDto.updatedBy.id} does not exist`,
        );
        return SPACE_RESPONSES.USER_NOT_FOUND(updateSpaceTypeDto.updatedBy.id);
      }

      const space = await this.spaceTypesRepository.findOne({
        where: { id: updateSpaceTypeDto.space.id },
      });
      if (!space) {
        this.logger.error(`Space with ID ${space.space.id} does not exist`);
        return SPACE_TYPES_RESPONSES.SPACE_NOT_FOUND(
          updateSpaceTypeDto.space.id,
        );
      }

      Object.assign(spaceType, updateSpaceTypeDto);
      const updatedSpaceType = await this.spaceTypesRepository.save(spaceType);

      this.logger.log(`Space Type with ID ${id} updated successfully`);

      return SPACE_TYPES_RESPONSES.SPACE_TYPE_UPDATED(updatedSpaceType, id);
    } catch (error) {
      this.logger.error(
        `Error updating space type with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the space type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeSpaceType(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const result = await this.spaceTypesRepository.delete(id);

      if (result.affected === 0) {
        this.logger.error(`Space Type with ID ${id} not found`);
        return SPACE_TYPES_RESPONSES.SPACE_TYPE_NOT_FOUND(id);
      }
      this.logger.log(`Space Type with ID ${id} deleted successfully`);
      return SPACE_TYPES_RESPONSES.SPACE_TYPE_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting space type with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the space type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}