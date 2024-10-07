import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponse } from '../commons/response-body/common.responses';
import { UserService } from './user.service';
import { SpaceBathroomTypes } from '../entities/space-bathroom-types.entity';
import { CreateSpaceBathroomTypesDto } from '../dto/requests/space-bathroom-types/create-space-bathroom-types.dto';
import { UpdateSpaceBathroomTypesDto } from '../dto/requests/space-bathroom-types/update-space-bathroom-types.dto';
import { BathroomType } from '../commons/constants/enumerations/space-bathroom-types.enum';
import { SPACE_BATHROOM_TYPES_RESPONSES } from '../commons/constants/response-constants/space-bathroom-types.constant';

@Injectable()
export class SpaceBathroomTypesService {
  constructor(
    @InjectRepository(SpaceBathroomTypes)
    private readonly spaceBathroomTypesRepository: Repository<SpaceBathroomTypes>,
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  async findSpaceBathroomTypeByName(
    name: BathroomType,
  ): Promise<SpaceBathroomTypes | null> {
    return await this.spaceBathroomTypesRepository.findOne({
      where: { name },
    });
  }

  async findAllSpaceBathroomTypes(): Promise<SpaceBathroomTypes[] | null> {
    return await this.spaceBathroomTypesRepository.find({
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

  async findSpaceBathroomTypeById(
    id: number,
  ): Promise<SpaceBathroomTypes | null> {
    return await this.spaceBathroomTypesRepository.findOne({
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

  async handleExistingSpaceBathroomType(
    name: string,
  ): Promise<ApiResponse<SpaceBathroomTypes>> {
    this.logger.error(
      `Error creating space bathroom type name: Space Bathroom Type ${name} already exists`,
    );
    return SPACE_BATHROOM_TYPES_RESPONSES.SPACE_BATHROOM_TYPE_ALREADY_EXISTS(
      name,
    );
  }

  async handleSpaceBathroomTypeNotFound(
    id: number,
  ): Promise<ApiResponse<SpaceBathroomTypes>> {
    this.logger.error(`Space bathroom type with ID ${id} not found`);
    return SPACE_BATHROOM_TYPES_RESPONSES.SPACE_BATHROOM_TYPE_NOT_FOUND(id);
  }

  async createSpaceBathroomType(
    createSpaceBathroomTypesDto: CreateSpaceBathroomTypesDto,
  ): Promise<ApiResponse<SpaceBathroomTypes>> {
    try {
      const existingSpaceBathroomType = await this.findSpaceBathroomTypeByName(
        createSpaceBathroomTypesDto.name,
      );
      if (existingSpaceBathroomType) {
        return await this.handleExistingSpaceBathroomType(
          createSpaceBathroomTypesDto.name,
        );
      }

      const existingUser = await this.userService.findUserById(
        createSpaceBathroomTypesDto.createdBy.id,
      );
      if (!existingUser) {
        return await this.userService.handleUserNotFound(
          createSpaceBathroomTypesDto.createdBy.id,
        );
      }

      const spaceBathroomType = this.spaceBathroomTypesRepository.create({
        ...createSpaceBathroomTypesDto,
      });
      const savedSpaceBathroomType =
        await this.spaceBathroomTypesRepository.save(spaceBathroomType);
      this.logger.log(
        `Space bathroom type ${createSpaceBathroomTypesDto.name} created with ID ${savedSpaceBathroomType.id}`,
      );
      return SPACE_BATHROOM_TYPES_RESPONSES.SPACE_BATHROOM_TYPE_CREATED(
        savedSpaceBathroomType,
      );
    } catch (error) {
      this.logger.error(
        `Error creating space bathroom type: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the space bathroom type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllSpaceBathroomTypes(): Promise<ApiResponse<SpaceBathroomTypes[]>> {
    try {
      const existingSpaceBathroomTypes = await this.findAllSpaceBathroomTypes();

      if (existingSpaceBathroomTypes.length === 0) {
        this.logger.log(`No space bathroom types are available`);
        return SPACE_BATHROOM_TYPES_RESPONSES.SPACE_BATHROOM_TYPES_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${existingSpaceBathroomTypes.length} space bathroom types successfully.`,
      );
      return SPACE_BATHROOM_TYPES_RESPONSES.SPACE_BATHROOM_TYPES_FETCHED(
        existingSpaceBathroomTypes,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving space bathroom types: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the space bathroom types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSpaceBathroomTypeById(
    id: number,
  ): Promise<ApiResponse<SpaceBathroomTypes>> {
    try {
      const existingSpaceBathroomType =
        await this.findSpaceBathroomTypeById(id);

      if (!existingSpaceBathroomType) {
        return await this.handleSpaceBathroomTypeNotFound(id);
      }

      this.logger.log(
        `Space bathroom type with ID ${id} retrieved successfully`,
      );
      return SPACE_BATHROOM_TYPES_RESPONSES.SPACE_BATHROOM_TYPE_FETCHED(
        existingSpaceBathroomType,
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving space bathroom type with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the space bathroom type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateSpaceBathroomTypeById(
    id: number,
    updateSpaceBathroomTypesDto: UpdateSpaceBathroomTypesDto,
  ): Promise<ApiResponse<SpaceBathroomTypes>> {
    try {
      const existingSpaceBathroomType =
        await this.findSpaceBathroomTypeById(id);
      if (!existingSpaceBathroomType) {
        return await this.handleSpaceBathroomTypeNotFound(id);
      }
      const existingUser = await this.userService.findUserById(
        updateSpaceBathroomTypesDto.updatedBy.id,
      );
      if (!existingUser) {
        return await this.userService.handleUserNotFound(
          updateSpaceBathroomTypesDto.updatedBy.id,
        );
      }

      const updatedSpaceBathroomType = this.spaceBathroomTypesRepository.merge(
        existingSpaceBathroomType,
        updateSpaceBathroomTypesDto,
      );
      await this.spaceBathroomTypesRepository.save(updatedSpaceBathroomType);
      this.logger.log(`Space bathroom type with ID ${id} updated successfully`);
      return SPACE_BATHROOM_TYPES_RESPONSES.SPACE_BATHROOM_TYPE_UPDATED(
        updatedSpaceBathroomType,
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error updating space bathroom type with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the space bathroom type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteSpaceBathroomTypeById(
    id: number,
  ): Promise<ApiResponse<SpaceBathroomTypes>> {
    try {
      const existingSpaceBathroomType =
        await this.findSpaceBathroomTypeById(id);
      if (!existingSpaceBathroomType) {
        return await this.handleSpaceBathroomTypeNotFound(id);
      }
      await this.spaceBathroomTypesRepository.remove(existingSpaceBathroomType);
      this.logger.log(`Space bathroom type with ID ${id} deleted successfully`);
      return SPACE_BATHROOM_TYPES_RESPONSES.SPACE_BATHROOM_TYPE_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting space bathroom type with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the space bathroom type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
