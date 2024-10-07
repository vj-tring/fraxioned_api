import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePropertySpaceDto } from '../dto/requests/property-space/create-property-space.dto';
import { ApiResponse } from '../commons/response-body/common.responses';
import { PropertySpace } from '../entities/property-space.entity';
import { UserService } from './user.service';
import { PropertiesService } from './properties.service';
import { PROPERTY_SPACE_RESPONSES } from '../commons/constants/response-constants/property-space.constant';
import { SpaceService } from './space.service';

@Injectable()
export class PropertySpaceService {
  constructor(
    @InjectRepository(PropertySpace)
    private readonly propertySpaceRepository: Repository<PropertySpace>,
    private readonly userService: UserService,
    private readonly propertyService: PropertiesService,
    private readonly spaceService: SpaceService,
    private readonly logger: LoggerService,
  ) {}

  async findPropertySpaceByObjectIds(
    instanceNumber: number,
    spaceId: number,
    propertyId: number,
  ): Promise<PropertySpace | null> {
    return await this.propertySpaceRepository.findOne({
      where: {
        property: { id: propertyId },
        space: { id: spaceId },
        instanceNumber: instanceNumber,
      },
      relations: ['property', 'space'],
      select: {
        property: {
          id: true,
          propertyName: true,
        },
        space: {
          id: true,
          name: true,
        },
      },
    });
  }

  async savePropertySpace(
    propertySpace: PropertySpace,
  ): Promise<PropertySpace | null> {
    return await this.propertySpaceRepository.save(propertySpace);
  }

  async findAllPropertySpaces(): Promise<PropertySpace[] | null> {
    return await this.propertySpaceRepository.find({
      relations: ['property', 'space', 'createdBy', 'updatedBy'],
      select: {
        property: {
          id: true,
          propertyName: true,
        },
        space: {
          id: true,
          name: true,
          isBedTypeAllowed: true,
          isBathroomTypeAllowed: true,
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

  async findPropertySpaceById(id: number): Promise<PropertySpace | null> {
    return await this.propertySpaceRepository.findOne({
      relations: ['property', 'space', 'createdBy', 'updatedBy'],
      select: {
        property: {
          id: true,
          propertyName: true,
        },
        space: {
          id: true,
          name: true,
          isBedTypeAllowed: true,
          isBathroomTypeAllowed: true,
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

  async findAllPropertySpacesByPropertyId(
    id: number,
  ): Promise<PropertySpace[] | null> {
    return await this.propertySpaceRepository.find({
      relations: ['property', 'space', 'createdBy', 'updatedBy'],
      select: {
        property: {
          id: true,
          propertyName: true,
        },
        space: {
          id: true,
          name: true,
          isBedTypeAllowed: true,
          isBathroomTypeAllowed: true,
        },
        createdBy: {
          id: true,
        },
        updatedBy: {
          id: true,
        },
      },
      where: { property: { id } },
    });
  }

  async findCountOfSpaceForProperty(
    propertyId: number,
    spaceId: number,
  ): Promise<number> {
    return this.propertySpaceRepository.count({
      where: {
        property: { id: propertyId },
        space: { id: spaceId },
      },
    });
  }

  async handleExistingPropertySpace(
    propertyName: string,
    spaceName: string,
    instanceNumber: number,
  ): Promise<ApiResponse<PropertySpace>> {
    this.logger.error(
      `Property ${propertyName} with Space ${spaceName} ${instanceNumber} already exists`,
    );
    return PROPERTY_SPACE_RESPONSES.PROPERTY_SPACE_ALREADY_EXISTS(
      propertyName,
      spaceName,
      instanceNumber,
    );
  }

  async handlePropertySpaceNotFound(id: number): Promise<ApiResponse<null>> {
    this.logger.error(`Property space with ID ${id} not found`);
    return PROPERTY_SPACE_RESPONSES.PROPERTY_SPACE_NOT_FOUND(id);
  }

  async handlePropertySpacesNotFound(): Promise<ApiResponse<PropertySpace[]>> {
    this.logger.error(`No property spaces are available`);
    return PROPERTY_SPACE_RESPONSES.PROPERTY_SPACES_NOT_FOUND();
  }

  async returnAvailablePropertySpaces(
    existingPropertySpaces: PropertySpace[],
  ): Promise<ApiResponse<PropertySpace[]>> {
    this.logger.log(
      `Retrieved ${existingPropertySpaces.length} property spaces successfully.`,
    );
    return PROPERTY_SPACE_RESPONSES.PROPERTY_SPACES_FETCHED(
      existingPropertySpaces,
    );
  }

  async createPropertySpace(
    createPropertySpaceDto: CreatePropertySpaceDto,
  ): Promise<ApiResponse<PropertySpace>> {
    try {
      const existingUser = await this.userService.findUserById(
        createPropertySpaceDto.createdBy.id,
      );
      if (!existingUser) {
        return await this.userService.handleUserNotFound(
          createPropertySpaceDto.createdBy.id,
        );
      }

      const existingProperty = await this.propertyService.findPropertyById(
        createPropertySpaceDto.property.id,
      );
      if (!existingProperty) {
        return await this.propertyService.handlePropertyNotFound(
          createPropertySpaceDto.property.id,
        );
      }

      const existingSpace = await this.spaceService.findSpaceById(
        createPropertySpaceDto.space.id,
      );

      if (!existingSpace) {
        return await this.spaceService.handleSpaceNotFound(
          createPropertySpaceDto.space.id,
        );
      }

      const instanceNumber =
        (await this.findCountOfSpaceForProperty(
          createPropertySpaceDto.property.id,
          createPropertySpaceDto.space.id,
        )) + 1;

      const existingPropertySpace = await this.findPropertySpaceByObjectIds(
        createPropertySpaceDto.property.id,
        createPropertySpaceDto.space.id,
        instanceNumber,
      );
      if (existingPropertySpace) {
        return await this.handleExistingPropertySpace(
          existingProperty.propertyName,
          existingSpace.name,
          instanceNumber,
        );
      }
      const propertySpace = this.propertySpaceRepository.create({
        ...createPropertySpaceDto,
        instanceNumber,
      });
      const savedPropertySpace = await this.savePropertySpace(propertySpace);

      this.logger.log(
        `Space ${existingSpace.name} ${instanceNumber} for Property ${existingProperty.propertyName} created`,
      );
      return PROPERTY_SPACE_RESPONSES.PROPERTY_SPACE_CREATED(
        savedPropertySpace,
        existingSpace.name,
        existingProperty.propertyName,
      );
    } catch (error) {
      this.logger.error(
        `Error creating property space: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the property space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllPropertySpaces(): Promise<ApiResponse<PropertySpace[]>> {
    try {
      const existingPropertySpaces = await this.findAllPropertySpaces();

      if (existingPropertySpaces.length === 0) {
        return await this.handlePropertySpacesNotFound();
      }

      return await this.returnAvailablePropertySpaces(existingPropertySpaces);
    } catch (error) {
      this.logger.error(
        `Error retrieving property spaces: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all the property spaces',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPropertySpaceById(id: number): Promise<ApiResponse<PropertySpace>> {
    try {
      const existingPropertySpace = await this.findPropertySpaceById(id);

      if (!existingPropertySpace) {
        return await this.handlePropertySpaceNotFound(id);
      }

      this.logger.log(`Property Space with ID ${id} retrieved successfully`);
      return PROPERTY_SPACE_RESPONSES.PROPERTY_SPACE_FETCHED(
        existingPropertySpace,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property space with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the property space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPropertySpaceByPropertyId(
    propertyId: number,
  ): Promise<ApiResponse<PropertySpace[]>> {
    try {
      const existingPropertySpaces =
        await this.findAllPropertySpacesByPropertyId(propertyId);

      if (existingPropertySpaces.length === 0) {
        return await this.handlePropertySpacesNotFound();
      }
      return await this.returnAvailablePropertySpaces(existingPropertySpaces);
    } catch (error) {
      this.logger.error(
        `Error retrieving property spaces: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all the spaces for the selected property',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removePropertySpace(id: number): Promise<ApiResponse<PropertySpace>> {
    try {
      const result = await this.propertySpaceRepository.delete(id);
      if (result.affected === 0) {
        return await this.handlePropertySpaceNotFound(id);
      }
      this.logger.log(`Property space with ID ${id} deleted successfully`);
      return PROPERTY_SPACE_RESPONSES.PROPERTY_SPACE_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting property space with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
