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

@Injectable()
export class SpaceBedTypeService {
  constructor(
    @InjectRepository(SpaceBedType)
    private readonly spaceBedTypeRepository: Repository<SpaceBedType>,
    private readonly logger: LoggerService,
    private readonly userService: UserService,
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
      const result = await this.spaceBedTypeRepository.delete(id);
      if (result.affected === 0) {
        this.logger.error(`Space bed type with ID ${id} not found`);
        return SPACE_BED_TYPE_RESPONSES.SPACE_BED_TYPE_NOT_FOUND(id);
      }
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
