import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { PropertySpaceBed } from '../entities/property-space-bed.entity';
import { CreatePropertySpaceBedDto } from '../dto/requests/property-space-bed/create-property-space-bed.dto';
import { ApiResponse } from '../commons/response-body/common.responses';
import { PROPERTY_SPACE_BED_RESPONSES } from '../commons/constants/response-constants/property-space-bed.constant';
import { UpdatePropertySpaceBedDto } from '../dto/requests/property-space-bed/update-property-space-bed.dto';
import { UserService } from './user.service';
import { SpaceBedTypeService } from './space-bed-type.service';
import { PropertySpaceService } from './property-space.service';
import { count } from 'console';

@Injectable()
export class PropertySpaceBedService {
  constructor(
    @InjectRepository(PropertySpaceBed)
    private readonly propertySpaceBedRepository: Repository<PropertySpaceBed>,
    private readonly logger: LoggerService,
    private readonly userService: UserService,
    private readonly propertySpaceService: PropertySpaceService,
    private readonly spaceBedTypeService: SpaceBedTypeService,
  ) {}

  async handlePropertySpaceBedNotFound(id: number): Promise<ApiResponse<null>> {
    this.logger.error(`Property space bed with ID ${id} not found`);
    return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BED_NOT_FOUND(id);
  }

  async findAllPropertySpaceBeds(): Promise<PropertySpaceBed[] | null> {
    return await this.propertySpaceBedRepository.find({
      relations: ['propertySpace', 'spaceBedType', 'createdBy', 'updatedBy'],
      select: {
        propertySpace: { id: true },
        spaceBedType: { id: true },
        createdBy: { id: true },
        updatedBy: { id: true },
      },
    });
  }

  async findPropertySpaceBedById(id: number): Promise<PropertySpaceBed | null> {
    return await this.propertySpaceBedRepository.findOne({
      relations: ['propertySpace', 'spaceBedType', 'createdBy', 'updatedBy'],
      where: { id },
      select: {
        propertySpace: { id: true },
        spaceBedType: { id: true },
        createdBy: { id: true },
        updatedBy: { id: true },
      },
    });
  }

  async createPropertySpaceBed(
    createPropertySpaceBedDto: CreatePropertySpaceBedDto,
  ): Promise<ApiResponse<PropertySpaceBed>> {
    try {
      const existingPropertySpace =
        await this.propertySpaceService.findPropertySpaceById(
          createPropertySpaceBedDto.propertySpace.id,
        );
      if (!existingPropertySpace) {
        return this.propertySpaceService.handlePropertySpaceNotFound(
          createPropertySpaceBedDto.propertySpace.id,
        );
      }

      const existingSpaceBedType =
        await this.spaceBedTypeService.findSpaceBedTypeById(
          createPropertySpaceBedDto.spaceBedType.id,
        );
      if (!existingSpaceBedType) {
        return this.spaceBedTypeService.handleSpaceBedTypeNotFound(
          createPropertySpaceBedDto.spaceBedType.id,
        );
      }

      const existingUser = await this.userService.findUserById(
        createPropertySpaceBedDto.createdBy.id,
      );
      if (!existingUser) {
        return this.userService.handleUserNotFound(
          createPropertySpaceBedDto.createdBy.id,
        );
      }

      const propertySpaceBed = this.propertySpaceBedRepository.create({
        ...createPropertySpaceBedDto,
        propertySpace: existingPropertySpace,
        spaceBedType: existingSpaceBedType,
        createdBy: existingUser,
      });
      const savedPropertySpaceBed =
        await this.propertySpaceBedRepository.save(propertySpaceBed);
      this.logger.log(
        `Property space bed created with ID ${savedPropertySpaceBed.id}`,
      );

      const createdPropertySpaceBedResponse = {
        id: savedPropertySpaceBed.id,
        propertySpaceId: savedPropertySpaceBed.propertySpace.id,
        spaceBedTypeId: savedPropertySpaceBed.spaceBedType.id,
        createdBy: savedPropertySpaceBed.createdBy.id,
        createdAt: savedPropertySpaceBed.createdAt,
        count: savedPropertySpaceBed.count,
      } as unknown as PropertySpaceBed;
      return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BED_CREATED(
        createdPropertySpaceBedResponse,
      );
    } catch (error) {
      this.logger.error(
        `Error creating property space bed: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the property space bed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllPropertySpaceBeds(): Promise<ApiResponse<PropertySpaceBed[]>> {
    try {
      const existingPropertySpaceBeds = await this.findAllPropertySpaceBeds();

      if (existingPropertySpaceBeds.length === 0) {
        this.logger.log(`No property space beds are available`);
        return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BEDS_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${existingPropertySpaceBeds.length} property space beds successfully.`,
      );
      return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BEDS_FETCHED(
        existingPropertySpaceBeds,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property space beds: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all property space beds',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPropertySpaceBedById(
    id: number,
  ): Promise<ApiResponse<PropertySpaceBed>> {
    try {
      const existingPropertySpaceBed = await this.findPropertySpaceBedById(id);

      if (!existingPropertySpaceBed) {
        return this.handlePropertySpaceBedNotFound(id);
      }

      this.logger.log(
        `Property space bed with ID ${id} retrieved successfully`,
      );
      return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BED_FETCHED(
        existingPropertySpaceBed,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property space bed with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the property space bed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePropertySpaceBedById(
    id: number,
    updatePropertySpaceBedDto: UpdatePropertySpaceBedDto,
  ): Promise<ApiResponse<PropertySpaceBed>> {
    try {
      const existingPropertySpaceBed = await this.findPropertySpaceBedById(id);

      if (!existingPropertySpaceBed) {
        return this.handlePropertySpaceBedNotFound(id);
      }

      if (updatePropertySpaceBedDto.propertySpace) {
        const existingPropertySpace =
          await this.propertySpaceService.findPropertySpaceById(
            updatePropertySpaceBedDto.propertySpace.id,
          );
        if (!existingPropertySpace) {
          return this.propertySpaceService.handlePropertySpaceNotFound(
            updatePropertySpaceBedDto.propertySpace.id,
          );
        }
        existingPropertySpaceBed.propertySpace = existingPropertySpace;
      }

      if (updatePropertySpaceBedDto.spaceBedType) {
        const existingSpaceBedType =
          await this.spaceBedTypeService.findSpaceBedTypeById(
            updatePropertySpaceBedDto.spaceBedType.id,
          );
        if (!existingSpaceBedType) {
          return this.spaceBedTypeService.handleSpaceBedTypeNotFound(
            updatePropertySpaceBedDto.spaceBedType.id,
          );
        }
        existingPropertySpaceBed.spaceBedType = existingSpaceBedType;
      }

      if (updatePropertySpaceBedDto.updatedBy) {
        const existingUser = await this.userService.findUserById(
          updatePropertySpaceBedDto.updatedBy.id,
        );
        if (!existingUser) {
          return this.userService.handleUserNotFound(
            updatePropertySpaceBedDto.updatedBy.id,
          );
        }
        existingPropertySpaceBed.updatedBy = existingUser;
      }

      Object.assign(existingPropertySpaceBed, updatePropertySpaceBedDto);
      const updatedPropertySpaceBed =
        await this.propertySpaceBedRepository.save(existingPropertySpaceBed);
      this.logger.log(`Property space bed with ID ${id} updated successfully`);
      const updatedPropertySpaceBedResponse = {
        id: updatedPropertySpaceBed.id,
        propertySpaceId: updatedPropertySpaceBed.propertySpace.id,
        spaceBedTypeId: updatedPropertySpaceBed.spaceBedType.id,
        updatedBy: updatedPropertySpaceBed.updatedBy.id,
        updatedAt: updatedPropertySpaceBed.updatedAt,
        count: updatedPropertySpaceBed.count,
      } as unknown as PropertySpaceBed;
      return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BED_UPDATED(
        updatedPropertySpaceBedResponse,
      );
    } catch (error) {
      this.logger.error(
        `Error updating property space bed with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the property space bed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePropertySpaceBedFromRepository(
    id: number,
  ): Promise<DeleteResult> {
    return this.propertySpaceBedRepository.delete(id);
  }

  async deletePropertySpaceBedById(
    id: number,
  ): Promise<ApiResponse<PropertySpaceBed>> {
    try {
      const result = await this.deletePropertySpaceBedFromRepository(id);
      if (result.affected === 0) {
        this.logger.error(`Property space bed with ID ${id} not found`);
        return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BED_NOT_FOUND(id);
      }
      this.logger.log(`Property space bed with ID ${id} deleted successfully`);
      return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BED_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting property space bed with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property space bed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
