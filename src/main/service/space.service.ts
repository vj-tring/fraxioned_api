import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from '../entities/space.entity';
import { SPACE_RESPONSES } from '../commons/constants/response-constants/space.constant';
import { CreateSpaceDto } from '../dto/requests/space/create-space.dto';
import { User } from '../entities/user.entity';
import { UpdateSpaceDto } from '../dto/requests/space/update-space.dto';
import { SpaceTypes } from '../entities/space-types.entity';
import { ApiResponse } from '../commons/response-body/common.responses';
import { UserService } from './user.service';

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SpaceTypes)
    private readonly spaceTypesRepository: Repository<SpaceTypes>,
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  async findSpaceByName(name: string): Promise<Space | null> {
    return await this.spaceRepository.findOne({
      where: { name },
    });
  }

  async createSpace(
    createSpaceDto: CreateSpaceDto,
  ): Promise<ApiResponse<Space>> {
    try {
      const existingSpace = await this.findSpaceByName(createSpaceDto.name);
      if (existingSpace) {
        this.logger.error(
          `Error creating space: Space ${createSpaceDto.name} already exists`,
        );
        return SPACE_RESPONSES.SPACE_ALREADY_EXISTS(createSpaceDto.name);
      }

      const existingUser = await this.userService.findUserById(
        createSpaceDto.createdBy.id,
      );
      if (!existingUser) {
        this.logger.error(
          `User with ID ${createSpaceDto.createdBy.id} does not exist`,
        );
        return SPACE_RESPONSES.USER_NOT_FOUND(createSpaceDto.createdBy.id);
      }

      const space = this.spaceRepository.create({
        ...createSpaceDto,
      });
      const savedSpace = await this.spaceRepository.save(space);
      this.logger.log(
        `Space ${createSpaceDto.name} created with ID ${savedSpace.id}`,
      );
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

  async findAllSpaces(): Promise<ApiResponse<Space[]>> {
    try {
      const spaces = await this.spaceRepository.find({
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

      if (spaces.length === 0) {
        this.logger.log(`No spaces are available`);
        return SPACE_RESPONSES.SPACES_NOT_FOUND();
      }

      this.logger.log(`Retrieved ${spaces.length} spaces successfully.`);
      return SPACE_RESPONSES.SPACES_FETCHED(spaces);
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

  async findSpaceById(id: number): Promise<ApiResponse<Space>> {
    try {
      const space = await this.spaceRepository.findOne({
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

      if (!space) {
        this.logger.error(`Space with ID ${id} not found`);
        return SPACE_RESPONSES.SPACE_NOT_FOUND(id);
      }

      this.logger.log(`Space with ID ${id} retrieved successfully`);
      return SPACE_RESPONSES.SPACE_FETCHED(space, id);
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
  ): Promise<ApiResponse<Space>> {
    try {
      const space = await this.spaceRepository.findOne({
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
      if (!space) {
        this.logger.error(`Space with ID ${id} not found`);
        return SPACE_RESPONSES.SPACE_NOT_FOUND(id);
      }
      const user = await this.userRepository.findOne({
        where: {
          id: updateSpaceDto.updatedBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${updateSpaceDto.updatedBy.id} does not exist`,
        );
        return SPACE_RESPONSES.USER_NOT_FOUND(updateSpaceDto.updatedBy.id);
      }
      Object.assign(space, updateSpaceDto);
      const updatedSpace = await this.spaceRepository.save(space);
      this.logger.log(`Space with ID ${id} updated successfully`);
      return SPACE_RESPONSES.SPACE_UPDATED(updatedSpace, id);
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
      const spaceType = await this.spaceTypesRepository.findOne({
        where: { space: { id: id } },
      });
      if (spaceType) {
        this.logger.log(
          `Space ID ${id} exists and is mapped to space type, hence cannot be deleted.`,
        );
        return SPACE_RESPONSES.SPACE_FOREIGN_KEY_CONFLICT(id);
      }
      const result = await this.spaceRepository.delete(id);
      if (result.affected === 0) {
        this.logger.error(`Space with ID ${id} not found`);
        return SPACE_RESPONSES.SPACE_NOT_FOUND(id);
      }
      this.logger.log(`Space with ID ${id} deleted successfully`);
      return SPACE_RESPONSES.SPACE_DELETED(id);
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
