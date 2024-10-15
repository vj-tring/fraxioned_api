import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoggerService } from './logger.service';
import { Property } from '../entities/property.entity';
import { Amenities } from '../entities/amenities.entity';
import { PROPERTY_SPACE_AMENITY_RESPONSES } from '../commons/constants/response-constants/property-space-amenity.constant';
import { PropertySpaceService } from './property-space.service';
import { PropertySpace } from '../entities/property-space.entity';
import { CreateOrDeletePropertySpaceAmenitiesDto } from '../dto/requests/property-space-amenity/create-or-delete-property-amenities.dto';
import { CreatePropertySpaceAmenitiesDto } from '../dto/requests/property-space-amenity/create-property-space-amenities.dto';
import { UpdatePropertySpaceAmenitiesDto } from '../dto/requests/property-space-amenity/update-property-space-amenities.dto';
import { PropertySpaceAmenities } from '../entities/property-space-amenity.entity';

@Injectable()
export class PropertySpaceAmenitiesService {
  constructor(
    @InjectRepository(PropertySpaceAmenities)
    private readonly PropertySpaceAmenitiesRepository: Repository<PropertySpaceAmenities>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Amenities)
    private readonly amenityRepository: Repository<Amenities>,
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
    @InjectRepository(PropertySpace)
    private readonly propertySpaceRepository: Repository<PropertySpace>,
    private readonly logger: LoggerService,
    @Inject(forwardRef(() => PropertySpaceService))
    private readonly propertySpaceService: PropertySpaceService,
  ) {}

  async removePropertySpaceAmenitiesByPropertySpaceId(
    propertyId: number,
    propertySpaceId: number,
  ): Promise<void> {
    const [amenitiesWithoutNull, amenitiesWithNull] = await Promise.all([
      this.getAmenitiesByPropertyAndSpace(propertyId, propertySpaceId),
      this.getAmenitiesByPropertyWithNullSpace(propertyId),
    ]);

    const withNullIds = new Set(amenitiesWithNull.map((a) => a.amenity.id));
    const filteredIds = amenitiesWithoutNull
      .map((m) => m.amenity.id)
      .filter((id) => withNullIds.has(id));

    if (filteredIds.length > 0) {
      const propertySpaceWithNull =
        await this.PropertySpaceAmenitiesRepository.find({
          where: {
            property: { id: propertyId },
            propertySpace: { id: Not(IsNull()) },
          },
          select: ['propertySpace'],
          relations: ['propertySpace'],
        });
      const distinctPropertySpaceIds = new Set(
        propertySpaceWithNull.map((item) => item.propertySpace.id),
      );

      if (distinctPropertySpaceIds.size < 2) {
        const existingAmenities = await this.getExistingPropertySpaceAmenities(
          propertyId,
          filteredIds,
        );
        if (existingAmenities.length > 0) {
          await this.PropertySpaceAmenitiesRepository.remove(existingAmenities);
        }
      }
    }
    await this.PropertySpaceAmenitiesRepository.remove(amenitiesWithoutNull);
    return;
  }

  private async getAmenitiesByPropertyAndSpace(
    propertyId: number,
    propertySpaceId: number,
  ): Promise<PropertySpaceAmenities[]> {
    return await this.PropertySpaceAmenitiesRepository.find({
      relations: ['amenity'],
      where: {
        property: { id: propertyId },
        propertySpace: { id: propertySpaceId },
      },
    });
  }

  private async getAmenitiesByPropertyWithNullSpace(
    propertyId: number,
  ): Promise<PropertySpaceAmenities[]> {
    return await this.PropertySpaceAmenitiesRepository.find({
      relations: ['amenity'],
      where: { property: { id: propertyId }, propertySpace: { id: IsNull() } },
    });
  }

  private async getExistingPropertySpaceAmenities(
    propertyId: number,
    amenityIds: number[],
  ): Promise<PropertySpaceAmenities[]> {
    return await this.PropertySpaceAmenitiesRepository.findBy({
      property: { id: propertyId },
      amenity: { id: In(amenityIds) },
    });
  }

  async createPropertyAmenity(
    createPropertyAmenityDto: CreatePropertySpaceAmenitiesDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities;
    statusCode: number;
  }> {
    try {
      this.logger.log(
        `Creating mapping for property ${createPropertyAmenityDto.property.id} to the space and amenity ${createPropertyAmenityDto.amenity.id}`,
      );

      const existingProperty = await this.propertiesRepository.findOne({
        where: {
          id: createPropertyAmenityDto.property.id,
        },
      });
      if (!existingProperty) {
        this.logger.error(
          `Property with ID ${createPropertyAmenityDto.property.id} does not exist`,
        );
        return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_NOT_FOUND(
          createPropertyAmenityDto.property.id,
        );
      }

      const existingAmenity = await this.amenityRepository.findOne({
        where: {
          id: createPropertyAmenityDto.amenity.id,
        },
      });
      if (!existingAmenity) {
        this.logger.error(
          `Amenity with ID ${createPropertyAmenityDto.amenity.id} does not exist`,
        );
        return PROPERTY_SPACE_AMENITY_RESPONSES.AMENITY_NOT_FOUND(
          createPropertyAmenityDto.amenity.id,
        );
      }

      const user = await this.usersRepository.findOne({
        where: {
          id: createPropertyAmenityDto.createdBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${createPropertyAmenityDto.createdBy.id} does not exist`,
        );
        return PROPERTY_SPACE_AMENITY_RESPONSES.USER_NOT_FOUND(
          createPropertyAmenityDto.createdBy.id,
        );
      }

      const existingPropertySpace =
        await this.propertySpaceService.findPropertySpaceById(
          createPropertyAmenityDto.propertySpace?.id,
        );
      if (!existingPropertySpace) {
        return this.propertySpaceService.handlePropertySpaceNotFound(
          createPropertyAmenityDto.propertySpace.id,
        );
      }
      const existingPropertySpaceAmenities =
        await this.PropertySpaceAmenitiesRepository.find({
          relations: ['property', 'amenity', 'propertySpace'],
          where: {
            property: { id: createPropertyAmenityDto.property.id },
            amenity: { id: createPropertyAmenityDto.amenity.id },
            propertySpace: createPropertyAmenityDto.propertySpace
              ? { id: createPropertyAmenityDto.propertySpace.id }
              : null,
          },
        });
      const hasExistingWithSpace = existingPropertySpaceAmenities.some(
        (pa) =>
          pa.propertySpace?.id === createPropertyAmenityDto.propertySpace?.id,
      );

      const hasExistingWithoutSpace = existingPropertySpaceAmenities.some(
        (pa) => pa.propertySpace === null,
      );

      if (
        (createPropertyAmenityDto.propertySpace && hasExistingWithSpace) ||
        (!createPropertyAmenityDto.propertySpace && hasExistingWithoutSpace)
      ) {
        const spaceInfo = createPropertyAmenityDto.propertySpace?.id
          ? ` and Property Space ID ${createPropertyAmenityDto.propertySpace.id}`
          : ' without a specific Property Space';

        this.logger.error(
          `Error creating property space amenity: Property ID ${createPropertyAmenityDto.property.id} with Amenity ID ${createPropertyAmenityDto.amenity.id}${spaceInfo} already exists`,
        );
        return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_AMENITY_ALREADY_EXISTS(
          createPropertyAmenityDto.property.id,
          createPropertyAmenityDto.amenity.id,
          createPropertyAmenityDto.propertySpace?.id,
        );
      }

      const propertyAmenity = this.PropertySpaceAmenitiesRepository.create({
        ...createPropertyAmenityDto,
      });
      const savedPropertyAmenity =
        await this.PropertySpaceAmenitiesRepository.save(propertyAmenity);
      this.logger.log(
        `Property Space Amenity with property ID ${createPropertyAmenityDto.property.id} and amenity ID ${createPropertyAmenityDto.amenity.id} created successfully`,
      );
      return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_AMENITY_CREATED(
        savedPropertyAmenity,
        savedPropertyAmenity.id,
      );
    } catch (error) {
      this.logger.error(
        `Error creating property space amenity: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the property space amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllPropertySAmenities(): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities[];
    statusCode: number;
  }> {
    try {
      const PropertySpaceAmenities =
        await this.PropertySpaceAmenitiesRepository.find({
          relations: [
            'property',
            'amenity',
            'amenity.createdBy',
            'amenity.updatedBy',
            'amenity.amenityGroup',
            'createdBy',
            'updatedBy',
          ],
          select: {
            property: {
              id: true,
            },
            amenity: {
              id: true,
              amenityName: true,
              amenityDescription: true,
              amenityGroup: {
                id: true,
                name: true,
              },
              createdAt: true,
              updatedAt: true,
              createdBy: {
                id: true,
              },
              updatedBy: {
                id: true,
              },
            },
            createdBy: {
              id: true,
            },
            updatedBy: {
              id: true,
            },
          },
        });

      if (PropertySpaceAmenities.length === 0) {
        this.logger.log(`No property space amenities are available`);

        return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_AMENITIES_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${PropertySpaceAmenities.length} amenities successfully.`,
      );

      return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_AMENITIES_FETCHED(
        PropertySpaceAmenities,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property space amenities: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the property space amenities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPropertyAmenityById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities;
    statusCode: number;
  }> {
    try {
      const propertyAmenity =
        await this.PropertySpaceAmenitiesRepository.findOne({
          relations: [
            'property',
            'amenity',
            'amenity.createdBy',
            'amenity.updatedBy',
            'amenity.amenityGroup',
            'createdBy',
            'updatedBy',
          ],
          select: {
            property: {
              id: true,
            },
            amenity: {
              id: true,
              amenityName: true,
              amenityDescription: true,
              amenityGroup: {
                id: true,
                name: true,
              },
              createdAt: true,
              updatedAt: true,
              createdBy: {
                id: true,
              },
              updatedBy: {
                id: true,
              },
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

      if (!propertyAmenity) {
        this.logger.error(`Property Space Amenity with ID ${id} not found`);
        return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_AMENITY_NOT_FOUND(
          id,
        );
      }
      this.logger.log(
        `Property Space Amenity with ID ${id} retrieved successfully`,
      );
      return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_AMENITY_FETCHED(
        propertyAmenity,
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving amenity with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAmenitiesByPropertySpaceId(propertySpaceId: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities[];
    statusCode: number;
  }> {
    try {
      const propertySpaceAmenities =
        await this.PropertySpaceAmenitiesRepository.find({
          relations: [
            'property',
            'amenity',
            'amenity.createdBy',
            'amenity.updatedBy',
            'amenity.amenityGroup',
            'createdBy',
            'updatedBy',
          ],
          select: {
            property: {
              id: true,
            },
            amenity: {
              id: true,
              amenityName: true,
              amenityDescription: true,
              amenityGroup: {
                id: true,
                name: true,
              },
              createdAt: true,
              updatedAt: true,
              createdBy: {
                id: true,
              },
              updatedBy: {
                id: true,
              },
            },
            createdBy: {
              id: true,
            },
            updatedBy: {
              id: true,
            },
          },
          where: { propertySpace: { id: propertySpaceId } },
        });

      if (propertySpaceAmenities.length === 0) {
        this.logger.error(`No amenities are available for this property space`);
        return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_AMENITIES_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${propertySpaceAmenities.length} amenities successfully.`,
      );
      return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_AMENITIES_FETCHED(
        propertySpaceAmenities,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property space amenities: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the amenities for the specified property space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAmenitiesByPropertyId(id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities[];
    statusCode: HttpStatus;
  }> {
    try {
      const PropertySpaceAmenities =
        await this.PropertySpaceAmenitiesRepository.find({
          relations: [
            'property',
            'propertySpace',
            'amenity',
            'amenity.createdBy',
            'amenity.updatedBy',
            'amenity.amenityGroup',
            'createdBy',
            'updatedBy',
          ],
          select: {
            property: {
              id: true,
            },
            propertySpace: {
              id: true,
            },
            amenity: {
              id: true,
              amenityName: true,
              amenityDescription: true,
              amenityGroup: {
                id: true,
                name: true,
              },
              createdAt: true,
              updatedAt: true,
              createdBy: {
                id: true,
              },
              updatedBy: {
                id: true,
              },
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

      if (PropertySpaceAmenities.length === 0) {
        this.logger.error(`No amenities are available for this property`);
        return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_AMENITIES_NOT_FOUND();
      }

      const uniqueAmenitiesMap = new Map<number, PropertySpaceAmenities>();
      PropertySpaceAmenities.forEach((propertyAmenity) => {
        const amenityId = propertyAmenity.amenity.id;
        if (!uniqueAmenitiesMap.has(amenityId)) {
          uniqueAmenitiesMap.set(amenityId, propertyAmenity);
        }
      });
      const uniqueAmenities = Array.from(uniqueAmenitiesMap.values());

      this.logger.log(
        `Retrieved ${PropertySpaceAmenities.length} amenities successfully.`,
      );
      return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_AMENITIES_FETCHED(
        uniqueAmenities,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property space amenities: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the amenities list for the selected property',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePropertyAmenity(
    id: number,
    updatePropertySpaceAmenitiesDto: UpdatePropertySpaceAmenitiesDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities;
    statusCode: number;
  }> {
    try {
      const propertyAmenity =
        await this.PropertySpaceAmenitiesRepository.findOne({
          relations: [
            'property',
            'amenity',
            'amenity.createdBy',
            'amenity.updatedBy',
            'amenity.amenityGroup',
            'createdBy',
            'updatedBy',
          ],
          select: {
            property: {
              id: true,
            },
            amenity: {
              id: true,
              amenityName: true,
              amenityDescription: true,
              amenityGroup: {
                id: true,
                name: true,
              },
              createdAt: true,
              updatedAt: true,
              createdBy: {
                id: true,
              },
              updatedBy: {
                id: true,
              },
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

      if (!propertyAmenity) {
        this.logger.error(
          `Property Space Amenity with ID ${id} does not exist`,
        );
        return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_AMENITY_NOT_FOUND(
          id,
        );
      }

      const user = await this.usersRepository.findOne({
        where: {
          id: updatePropertySpaceAmenitiesDto.updatedBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${updatePropertySpaceAmenitiesDto.updatedBy.id} does not exist`,
        );
        return PROPERTY_SPACE_AMENITY_RESPONSES.USER_NOT_FOUND(
          updatePropertySpaceAmenitiesDto.updatedBy.id,
        );
      }

      if (
        updatePropertySpaceAmenitiesDto.property &&
        updatePropertySpaceAmenitiesDto.property.id
      ) {
        const property = await this.propertiesRepository.findOne({
          where: { id: updatePropertySpaceAmenitiesDto.property.id },
        });
        if (!property) {
          this.logger.error(
            `Property with ID ${updatePropertySpaceAmenitiesDto.property.id} does not exist`,
          );
          return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_NOT_FOUND(
            updatePropertySpaceAmenitiesDto.property.id,
          );
        }
      }

      if (
        updatePropertySpaceAmenitiesDto.amenity &&
        updatePropertySpaceAmenitiesDto.amenity.id
      ) {
        const amenity = await this.amenityRepository.findOne({
          where: { id: updatePropertySpaceAmenitiesDto.amenity.id },
        });
        if (!amenity) {
          this.logger.error(
            `Amenity with ID ${updatePropertySpaceAmenitiesDto.amenity.id} does not exist`,
          );
          return PROPERTY_SPACE_AMENITY_RESPONSES.AMENITY_NOT_FOUND(
            updatePropertySpaceAmenitiesDto.amenity.id,
          );
        }
      }

      Object.assign(propertyAmenity, updatePropertySpaceAmenitiesDto);
      const updatedPropertyAmenity =
        await this.PropertySpaceAmenitiesRepository.save(propertyAmenity);

      this.logger.log(
        `Property Space Amenity with ID ${id} updated successfully`,
      );

      return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_AMENITY_UPDATED(
        updatedPropertyAmenity,
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error updating property space amenity with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the property space amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createOrDeletePropertySpaceAmenities(
    createOrDeletePropertySpaceAmenitiesDto: CreateOrDeletePropertySpaceAmenitiesDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities[];
    statusCode: HttpStatus;
  }> {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          id: createOrDeletePropertySpaceAmenitiesDto.updatedBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${createOrDeletePropertySpaceAmenitiesDto.updatedBy.id} does not exist`,
        );
        return PROPERTY_SPACE_AMENITY_RESPONSES.USER_NOT_FOUND(
          createOrDeletePropertySpaceAmenitiesDto.updatedBy.id,
        );
      }

      const existingProperty = await this.propertiesRepository.findOne({
        where: {
          id: createOrDeletePropertySpaceAmenitiesDto.property.id,
        },
      });
      if (!existingProperty) {
        this.logger.error(
          `Property with ID ${createOrDeletePropertySpaceAmenitiesDto.property.id} does not exist`,
        );
        return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_NOT_FOUND(
          createOrDeletePropertySpaceAmenitiesDto.property.id,
        );
      }

      let existingPropertySpace: PropertySpace = null;
      if (createOrDeletePropertySpaceAmenitiesDto.propertySpace.id > 0) {
        existingPropertySpace = await this.propertySpaceRepository.findOne({
          where: {
            id: createOrDeletePropertySpaceAmenitiesDto.propertySpace.id,
          },
        });
        if (!existingPropertySpace) {
          this.logger.error(
            `Property Space with ID ${createOrDeletePropertySpaceAmenitiesDto.propertySpace.id} does not exist`,
          );
          return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_NOT_FOUND(
            createOrDeletePropertySpaceAmenitiesDto.property.id,
          );
        }
      }

      const amenityIds = createOrDeletePropertySpaceAmenitiesDto.amenities.map(
        (amenity) => amenity.id,
      );
      const existingAmenities = await this.amenityRepository.findBy({
        id: In(amenityIds),
      });

      if (amenityIds.length > 0) {
        const nonExistingIds = amenityIds.filter(
          (id) => !existingAmenities.some((amenity) => amenity.id === id),
        );
        if (nonExistingIds.length > 0) {
          this.logger.error(
            `Amenities with ID(s) ${nonExistingIds.join(', ')} do not exist`,
          );
          return PROPERTY_SPACE_AMENITY_RESPONSES.AMENITIES_NOT_FOUND(
            nonExistingIds,
          );
        }
      }

      const existingMappings = await this.PropertySpaceAmenitiesRepository.find(
        {
          where: {
            property: {
              id: createOrDeletePropertySpaceAmenitiesDto.property.id,
            },
            propertySpace: {
              id: createOrDeletePropertySpaceAmenitiesDto.propertySpace.id,
            },
          },
          relations: ['amenity', 'propertySpace', 'property'],
        },
      );

      const existingAmenityIds = existingMappings.map((m) => m.amenity.id);

      const toDelete = existingMappings.filter(
        (mapping) => !amenityIds.includes(mapping.amenity.id),
      );

      const toCreate = amenityIds.filter(
        (id) => !existingAmenityIds.includes(id),
      );

      if (toDelete.length > 0) {
        for (const mapping of toDelete) {
          if (mapping.propertySpace) {
            const otherMappings = await this.getOtherMappings(mapping);
            const nullMappings = await this.getNullMappings(mapping);

            if (otherMappings.length <= 1) {
              await this.PropertySpaceAmenitiesRepository.remove(nullMappings);
            }
          }
          await this.PropertySpaceAmenitiesRepository.remove(mapping);
        }
      }

      if (toCreate.length > 0) {
        const amenitiesOnlyFromSpace = await this.getAmenitiesOnlyFromSpace(
          createOrDeletePropertySpaceAmenitiesDto.property.id,
          toCreate,
        );

        const filteredAmenityIds = amenitiesOnlyFromSpace.map(
          (m) => m.amenity.id,
        );

        const filteredMappings = filteredAmenityIds.filter(
          (id) => !toCreate.includes(id),
        );

        if (!filteredMappings) {
          await this.createPropertySpaceAmenities(
            filteredMappings,
            existingProperty,
            existingPropertySpace,
            user,
          );
        }

        await this.createPropertySpaceAmenities(
          toCreate,
          existingProperty,
          existingPropertySpace,
          user,
        );
      }

      this.logger.log(
        `Property Space Amenities for the selected property updated successfully`,
      );
      return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_AMENITIES_UPDATED();
    } catch (error) {
      this.logger.error(
        `Error creating property space amenities: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creation or deletion of property space amenities for the selected property',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async createPropertySpaceAmenities(
    filteredMappings: Array<number>,
    existingProperty: Property,
    existingPropertySpace: PropertySpace,
    user: User,
  ): Promise<void> {
    const newMappings = filteredMappings.map((amenityId) => {
      const amenity = new Amenities();
      amenity.id = amenityId;

      const propertyAmenity = new PropertySpaceAmenities();
      propertyAmenity.property = existingProperty;
      propertyAmenity.propertySpace = existingPropertySpace;
      propertyAmenity.amenity = amenity;
      propertyAmenity.createdBy = user;
      propertyAmenity.updatedBy = user;

      return propertyAmenity;
    });
    await this.PropertySpaceAmenitiesRepository.save(newMappings);
  }

  private async getOtherMappings(
    mapping: PropertySpaceAmenities,
  ): Promise<PropertySpaceAmenities[]> {
    return await this.PropertySpaceAmenitiesRepository.find({
      where: {
        property: {
          id: mapping.property.id,
        },
        amenity: {
          id: mapping.amenity.id,
        },
        propertySpace: {
          id: Not(IsNull()),
        },
      },
    });
  }

  private async getNullMappings(
    mapping: PropertySpaceAmenities,
  ): Promise<PropertySpaceAmenities[]> {
    return await this.PropertySpaceAmenitiesRepository.find({
      where: {
        property: {
          id: mapping.property.id,
        },
        amenity: {
          id: mapping.amenity.id,
        },
        propertySpace: {
          id: IsNull(),
        },
      },
    });
  }

  private async getAmenitiesOnlyFromSpace(
    propertyId: number,
    amenityIds: number[],
  ): Promise<PropertySpaceAmenities[]> {
    return await this.PropertySpaceAmenitiesRepository.find({
      relations: ['amenity'],
      where: {
        property: {
          id: propertyId,
        },
        amenity: {
          id: In(amenityIds),
        },
        propertySpace: {
          id: Not(IsNull()),
        },
      },
    });
  }

  async removePropertyAmenity(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const result = await this.PropertySpaceAmenitiesRepository.delete(id);

      if (result.affected === 0) {
        this.logger.error(`Property Space Amenity with ID ${id} not found`);
        return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_AMENITY_NOT_FOUND(
          id,
        );
      }
      this.logger.log(
        `Property Space Amenity with ID ${id} deleted successfully`,
      );
      return PROPERTY_SPACE_AMENITY_RESPONSES.PROPERTY_SPACE_AMENITY_DELETED(
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error deleting property amenity with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
