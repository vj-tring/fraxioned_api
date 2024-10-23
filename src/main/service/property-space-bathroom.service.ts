import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApiResponse } from '../commons/response-body/common.responses';
import { UserService } from './user.service';
import { PropertySpaceBathroom } from '../entities/property-space-bathroom.entity';
import { CreatePropertySpaceBathroomDto } from '../dto/requests/property-space-bathroom/create-property-space-bathroom.dto';
import { UpdatePropertySpaceBathroomDto } from '../dto/requests/property-space-bathroom/update-property-space-bathroom.dto';
import { PROPERTY_SPACE_BATHROOM_RESPONSES } from '../commons/constants/response-constants/property-space-bathroom.constant';
import { CreateOrDeletePropertySpaceBathroomsDto } from '../dto/requests/property-space-bathroom/create-or-delete.dto';
import { PROPERTY_SPACE_RESPONSES } from '../commons/constants/response-constants/property-space.constant';
import { USER_RESPONSES } from '../commons/constants/response-constants/user.constant';
import { PropertySpaceService } from './property-space.service';
import { SpaceBathroomTypes } from '../entities/space-bathroom-types.entity';

@Injectable()
export class PropertySpaceBathroomService {
  constructor(
    @InjectRepository(PropertySpaceBathroom)
    private readonly propertySpaceBathroomRepository: Repository<PropertySpaceBathroom>,
    @InjectRepository(SpaceBathroomTypes)
    private readonly spaceBathroomTypesRepository: Repository<SpaceBathroomTypes>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => PropertySpaceService))
    private readonly propertySpaceService: PropertySpaceService,
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
          name: true,
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
  async findPropertySpaceBathroomsByPropertySpaceId(
    propertySpaceId: number,
  ): Promise<PropertySpaceBathroom[] | null> {
    return await this.propertySpaceBathroomRepository.find({
      relations: [
        'spaceBathroomType',
        'propertySpace',
        'createdBy',
        'updatedBy',
      ],
      where: {
        propertySpace: {
          id: propertySpaceId,
        },
      },
      select: {
        spaceBathroomType: {
          id: true,
          name: true,
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
          name: true,
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

  async removeBathroomByPropertySpaceId(
    propertySpaceId: number,
  ): Promise<void> {
    await this.propertySpaceBathroomRepository.delete({
      propertySpace: { id: propertySpaceId },
    });
  }

  async findPropertySpaceBathroomBySpaceBathroomTypeId(
    id: number,
  ): Promise<PropertySpaceBathroom | null> {
    return await this.propertySpaceBathroomRepository.findOne({
      where: { spaceBathroomType: { id: id } },
    });
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
  async getPropertySpaceBathroomsByPropertySpaceId(
    propertySpaceId: number,
  ): Promise<ApiResponse<PropertySpaceBathroom[]>> {
    try {
      const propertySpaceBathrooms =
        await this.findPropertySpaceBathroomsByPropertySpaceId(propertySpaceId);

      if (!propertySpaceBathrooms || propertySpaceBathrooms.length === 0) {
        this.logger.log(
          `No property space bathrooms found for propertySpaceId ${propertySpaceId}`,
        );
        return PROPERTY_SPACE_BATHROOM_RESPONSES.PROPERTY_SPACE_BATHROOMS_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${propertySpaceBathrooms.length} property space bathrooms for propertySpaceId ${propertySpaceId} successfully.`,
      );
      return PROPERTY_SPACE_BATHROOM_RESPONSES.PROPERTY_SPACE_BATHROOMS_FETCHED(
        propertySpaceBathrooms,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property space bathrooms for propertySpaceId ${propertySpaceId}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the property space bathrooms',
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

  async createOrDeletePropertySpaceBathrooms(
    createOrDeletePropertySpaceBathroomsDto: CreateOrDeletePropertySpaceBathroomsDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceBathroom[];
    statusCode: HttpStatus;
  }> {
    try {
      const user = await this.userService.findUserById(
        createOrDeletePropertySpaceBathroomsDto.updatedBy.id,
      );
      if (!user) {
        this.logger.error(
          `User with ID ${createOrDeletePropertySpaceBathroomsDto.updatedBy.id} does not exist`,
        );
        return USER_RESPONSES.USER_NOT_FOUND(
          createOrDeletePropertySpaceBathroomsDto.updatedBy.id,
        );
      }

      const existingPropertySpace =
        await this.propertySpaceService.findPropertySpaceById(
          createOrDeletePropertySpaceBathroomsDto.propertySpace.id,
        );
      if (!existingPropertySpace) {
        this.logger.error(
          `Property space with ID ${createOrDeletePropertySpaceBathroomsDto.propertySpace.id} does not exist`,
        );
        return PROPERTY_SPACE_RESPONSES.PROPERTY_SPACE_NOT_FOUND(
          createOrDeletePropertySpaceBathroomsDto.propertySpace.id,
        );
      }

      const spaceBathroomTypeIds =
        createOrDeletePropertySpaceBathroomsDto.spaceBathroomTypes.map(
          (spaceBathroomType) => spaceBathroomType.spaceBathroomType.id,
        );

      const uniqueSpaceBathroomTypeIds = new Set(spaceBathroomTypeIds);
      if (uniqueSpaceBathroomTypeIds.size !== spaceBathroomTypeIds.length) {
        this.logger.error(
          `Duplicate spaceBathroomTypeId(s) found in the request for propertySpace with ID ${createOrDeletePropertySpaceBathroomsDto.propertySpace.id}`,
        );
        return PROPERTY_SPACE_BATHROOM_RESPONSES.DUPLICATE_SPACE_BATHROOM_TYPE();
      }

      const existingSpaceBathroomTypes =
        await this.spaceBathroomTypesRepository.findBy({
          id: In(spaceBathroomTypeIds),
        });

      const nonExistingIds = spaceBathroomTypeIds.filter(
        (id) =>
          !existingSpaceBathroomTypes.some(
            (spaceBathroomType) => spaceBathroomType.id === id,
          ),
      );

      if (nonExistingIds.length > 0) {
        this.logger.error(
          `Space bathroom types with ID(s) ${nonExistingIds.join(', ')} do not exist`,
        );
        return PROPERTY_SPACE_BATHROOM_RESPONSES.SPACE_BATHROOM_TYPES_NOT_FOUND(
          nonExistingIds,
        );
      }

      const existingMappings = await this.propertySpaceBathroomRepository.find({
        where: {
          propertySpace: {
            id: createOrDeletePropertySpaceBathroomsDto.propertySpace.id,
          },
        },
        relations: ['spaceBathroomType', 'propertySpace'],
      });

      const existingspaceBathroomTypeIds = existingMappings.map(
        (m) => m.spaceBathroomType.id,
      );

      const toUpdate = existingMappings.filter((mapping) =>
        spaceBathroomTypeIds.includes(mapping.spaceBathroomType.id),
      );

      const toCreate =
        createOrDeletePropertySpaceBathroomsDto.spaceBathroomTypes.filter(
          (spaceBathroomType) =>
            !existingspaceBathroomTypeIds.includes(
              spaceBathroomType.spaceBathroomType.id,
            ),
        );

      const toDelete = existingMappings.filter(
        (mapping) =>
          !spaceBathroomTypeIds.includes(mapping.spaceBathroomType.id),
      );

      if (toDelete.length > 0) {
        await this.propertySpaceBathroomRepository.remove(toDelete);
      }

      for (const mapping of toUpdate) {
        const newCount =
          createOrDeletePropertySpaceBathroomsDto.spaceBathroomTypes.find(
            (spaceBathroomType) =>
              spaceBathroomType.spaceBathroomType.id ===
              mapping.spaceBathroomType.id,
          )?.count;

        if (newCount !== undefined) {
          mapping.count = newCount;
          mapping.updatedBy = user;
        }
      }

      // Save updated mappings
      await this.propertySpaceBathroomRepository.save(toUpdate);

      // Create new mappings

      if (toCreate.length > 0) {
        const newMappings = toCreate.map((spaceBathroomTypeCount) => {
          const spaceBathroomType = existingSpaceBathroomTypes.find(
            (type) => type.id === spaceBathroomTypeCount.spaceBathroomType.id,
          );

          const propertySpaceBathroom = new PropertySpaceBathroom();
          propertySpaceBathroom.propertySpace = existingPropertySpace;
          propertySpaceBathroom.spaceBathroomType = spaceBathroomType;
          propertySpaceBathroom.count = spaceBathroomTypeCount.count;
          propertySpaceBathroom.createdBy = user;
          propertySpaceBathroom.updatedBy = user;

          return propertySpaceBathroom;
        });
        await this.propertySpaceBathroomRepository.save(newMappings);
      }

      this.logger.log(
        `Property space bathrooms for the selected property space updated successfully`,
      );
      return PROPERTY_SPACE_BATHROOM_RESPONSES.PROPERTY_SPACE_BATHROOMS_UPDATED();
    } catch (error) {
      this.logger.error(
        `Error creating property space bathrooms: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creation or deletion of property space bathrooms for the selected property space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
