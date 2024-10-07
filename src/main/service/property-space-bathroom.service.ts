import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponse } from '../commons/response-body/common.responses';
import { UserService } from './user.service';
import { PropertySpaceBathroom } from '../entities/property-space-bathroom.entity';
import { CreatePropertySpaceBathroomDto } from '../dto/requests/property-space-bathroom/create-property-space-bathroom.dto';
import { UpdatePropertySpaceBathroomDto } from '../dto/requests/property-space-bathroom/update-property-space-bathroom.dto';
import { PROPERTY_SPACE_BATHROOM_RESPONSES } from '../commons/constants/response-constants/property-space-bathroom.constant';

@Injectable()
export class PropertySpaceBathroomService {
  constructor(
    @InjectRepository(PropertySpaceBathroom)
    private readonly propertySpaceBathroomRepository: Repository<PropertySpaceBathroom>,
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  async findPropertySpaceBathroomByForeignIds(
    spaceBathroomTypeId: number,
    propertySpaceId: number,
  ): Promise<PropertySpaceBathroom | null> {
    return await this.propertySpaceBathroomRepository.findOne({
      relations: [
        'spaceBathroomType',
        'propertySpace',
        'createdBy',
        'updatedBy',
      ],
      where: {
        spaceBathroomType: {
          id: spaceBathroomTypeId,
        },
        propertySpace: {
          id: propertySpaceId,
        },
      },
    });
  }

  async findAllPropertySpaceBathroom(): Promise<
    PropertySpaceBathroom[] | null
  > {
    return await this.propertySpaceBathroomRepository.find({
      relations: [
        'spaceBathroomType',
        'propertySpace',
        'createdBy',
        'updatedBy',
      ],
      select: {
        spaceBathroomType: {
          id: true,
        },
        propertySpace: {
          id: true,
        },
        createdBy: {
          id: true,
        },
        updatedBy: {
          id: true,
        },
      },
    });
  }

  async findPropertySpaceBathroomById(
    id: number,
  ): Promise<PropertySpaceBathroom | null> {
    return await this.propertySpaceBathroomRepository.findOne({
      relations: [
        'spaceBathroomType',
        'propertySpace',
        'createdBy',
        'updatedBy',
      ],
      select: {
        spaceBathroomType: {
          id: true,
        },
        propertySpace: {
          id: true,
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
  }

  async removePropertySpaceBathroomById(id: number): Promise<boolean> {
    const existingPropertySpaceBathroom =
      await this.findPropertySpaceBathroomById(id);
    if (!existingPropertySpaceBathroom) {
      return false;
    }
    await this.propertySpaceBathroomRepository.remove(
      existingPropertySpaceBathroom,
    );
    return true;
  }

  async removeBathroomByPropertySpaceId(id: number): Promise<void> {
    const existingPropertySpaceBathroom =
      await this.propertySpaceBathroomRepository.findBy({
        spaceBathroomType: { id },
      });
    if (!existingPropertySpaceBathroom) {
      return null;
    }
    await this.propertySpaceBathroomRepository.remove(
      existingPropertySpaceBathroom,
    );
  }

  async handleExistingPropertySpaceBathroom(
    spaceBathroomTypeId: number,
    propertySpaceId: number,
  ): Promise<ApiResponse<PropertySpaceBathroom>> {
    this.logger.error(
      `Error creating property space bathroom by foreign ids: Property Space Bathroom ${spaceBathroomTypeId}, ${propertySpaceId} already exists`,
    );
    return PROPERTY_SPACE_BATHROOM_RESPONSES.PROPERTY_SPACE_BATHROOM_ALREADY_EXISTS(
      spaceBathroomTypeId,
      propertySpaceId,
    );
  }

  async handlePropertySpaceBathroomNotFound(
    id: number,
  ): Promise<ApiResponse<PropertySpaceBathroom>> {
    this.logger.error(`Property space bathroom with ID ${id} not found`);
    return PROPERTY_SPACE_BATHROOM_RESPONSES.PROPERTY_SPACE_BATHROOM_NOT_FOUND(
      id,
    );
  }

  async createPropertySpaceBathroom(
    createPropertySpaceBathroomDto: CreatePropertySpaceBathroomDto,
  ): Promise<ApiResponse<PropertySpaceBathroom>> {
    try {
      const existingPropertySpaceBathroom =
        await this.findPropertySpaceBathroomByForeignIds(
          createPropertySpaceBathroomDto.spaceBathroomType.id,
          createPropertySpaceBathroomDto.propertySpace.id,
        );
      if (existingPropertySpaceBathroom) {
        return await this.handleExistingPropertySpaceBathroom(
          createPropertySpaceBathroomDto.spaceBathroomType.id,
          createPropertySpaceBathroomDto.propertySpace.id,
        );
      }

      const existingUser = await this.userService.findUserById(
        createPropertySpaceBathroomDto.createdBy.id,
      );
      if (!existingUser) {
        return await this.userService.handleUserNotFound(
          createPropertySpaceBathroomDto.createdBy.id,
        );
      }

      const propertySpaceBathroom = this.propertySpaceBathroomRepository.create(
        {
          ...createPropertySpaceBathroomDto,
        },
      );
      const savedPropertySpaceBathroom =
        await this.propertySpaceBathroomRepository.save(propertySpaceBathroom);
      this.logger.log(
        `Property space bathroom created with ID ${savedPropertySpaceBathroom.id}`,
      );
      return PROPERTY_SPACE_BATHROOM_RESPONSES.PROPERTY_SPACE_BATHROOM_CREATED(
        savedPropertySpaceBathroom,
      );
    } catch (error) {
      this.logger.error(
        `Error creating property space bathroom: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the property space bathroom',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllPropertySpaceBathroom(): Promise<
    ApiResponse<PropertySpaceBathroom[]>
  > {
    try {
      const existingPropertySpaceBathroom =
        await this.findAllPropertySpaceBathroom();

      if (existingPropertySpaceBathroom.length === 0) {
        this.logger.log(`No proerty space bathroom are available`);
        return PROPERTY_SPACE_BATHROOM_RESPONSES.PROPERTY_SPACE_BATHROOMS_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${existingPropertySpaceBathroom.length} property space bathroom successfully.`,
      );
      return PROPERTY_SPACE_BATHROOM_RESPONSES.PROPERTY_SPACE_BATHROOMS_FETCHED(
        existingPropertySpaceBathroom,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property space bathroom: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the property space bathroom',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPropertySpaceBathroomById(
    id: number,
  ): Promise<ApiResponse<PropertySpaceBathroom>> {
    try {
      const existingPropertySpaceBathroom =
        await this.findPropertySpaceBathroomById(id);

      if (!existingPropertySpaceBathroom) {
        return await this.handlePropertySpaceBathroomNotFound(id);
      }

      this.logger.log(
        `Property space bathroom with ID ${id} retrieved successfully`,
      );
      return PROPERTY_SPACE_BATHROOM_RESPONSES.PROPERTY_SPACE_BATHROOM_FETCHED(
        existingPropertySpaceBathroom,
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property space bathroom with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the property space bathroom',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePropertySpaceBathroomById(
    id: number,
    updatePropertySpaceBathroomDto: UpdatePropertySpaceBathroomDto,
  ): Promise<ApiResponse<PropertySpaceBathroom>> {
    try {
      const existingPropertySpaceBathroom =
        await this.findPropertySpaceBathroomById(id);
      if (!existingPropertySpaceBathroom) {
        return await this.handlePropertySpaceBathroomNotFound(id);
      }
      const existingUser = await this.userService.findUserById(
        updatePropertySpaceBathroomDto.updatedBy.id,
      );
      if (!existingUser) {
        return await this.userService.handleUserNotFound(
          updatePropertySpaceBathroomDto.updatedBy.id,
        );
      }

      const updatedPropertySpaceBathroom =
        this.propertySpaceBathroomRepository.merge(
          existingPropertySpaceBathroom,
          updatePropertySpaceBathroomDto,
        );
      await this.propertySpaceBathroomRepository.save(
        updatedPropertySpaceBathroom,
      );
      this.logger.log(
        `Property space bathroom with ID ${id} updated successfully`,
      );
      return PROPERTY_SPACE_BATHROOM_RESPONSES.PROPERTY_SPACE_BATHROOM_UPDATED(
        updatedPropertySpaceBathroom,
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error updating property space bathroom with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the property space bathroom',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePropertySpaceBathroomById(
    id: number,
  ): Promise<ApiResponse<PropertySpaceBathroom>> {
    try {
      const removedPropertySpaceBathroom =
        await this.removePropertySpaceBathroomById(id);
      if (!removedPropertySpaceBathroom)
        return await this.handlePropertySpaceBathroomNotFound(id);
      this.logger.log(
        `Property space bathroom with ID ${id} deleted successfully`,
      );
      return PROPERTY_SPACE_BATHROOM_RESPONSES.PROPERTY_SPACE_BATHROOM_DELETED(
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error deleting property space bathroom with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property space bathroom',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
