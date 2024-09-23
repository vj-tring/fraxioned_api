import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonPropertiesResponseDto } from 'src/main/dto/responses/common-properties.dto';
import { CreatePropertiesResponseDto } from 'src/main/dto/responses/create-properties.dto';
import { UpdatePropertiesResponseDto } from 'src/main/dto/responses/update-properties.dto';
import { Property } from 'src/main/entities/property.entity';
import { Repository } from 'typeorm';
import { PropertyDetails } from '../entities/property-details.entity';
import { ComparePropertiesDto } from '../dto/ownerRez-properties.dto';
import axios from 'axios';
import { USER_PROPERTY_RESPONSES } from '../commons/constants/response-constants/user-property.constant';
import { PropertyWithDetailsResponseDto } from '../dto/responses/PropertyWithDetailsResponseDto.dto';
import { UserProperties } from '../entities/user-properties.entity';
import { UserPropertyWithDetailsResponseDto } from '../dto/responses/userPropertyResponse.dto';
import { PropertyWithDetails } from '../commons/interface/userPropertyDetails';
import { CreatePropertiesDto } from '../dto/requests/property/create-property.dto';
import { UpdatePropertiesDto } from '../dto/requests/property/update-properties.dto';
import { User } from '../entities/user.entity';
import { USER_RESPONSES } from '../commons/constants/response-constants/user.constant';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    @InjectRepository(PropertyDetails)
    private propertyDetailsRepository: Repository<PropertyDetails>,
    @InjectRepository(UserProperties)
    private userPropertiesRepository: Repository<UserProperties>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  private async shouldApplyPropertyNameFilter(
    userId: number,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
      select: { role: { id: true } },
    });
    return user?.role.id !== 1;
  }

  private async setPropertyName(
    property: Property,
    userId: number,
  ): Promise<Property> {
    const shouldApplyFilter = await this.shouldApplyPropertyNameFilter(userId);
    if (shouldApplyFilter && (property.id === 1 || property.id === 2)) {
      property.propertyName = 'Paradise Shores';
    }
    return property;
  }
  async createProperties(
    createPropertiesDto: CreatePropertiesDto,
  ): Promise<CreatePropertiesResponseDto> {
    try {
      const properties = this.propertiesRepository.create(createPropertiesDto);
      const savedProperties = await this.propertiesRepository.save(properties);
      return savedProperties;
    } catch (error) {
      throw error;
    }
  }

  async updatePropertiesById(
    id: number,
    updatePropertiesDto: UpdatePropertiesDto,
  ): Promise<UpdatePropertiesResponseDto> {
    try {
      const existingProperties = await this.propertiesRepository.findOne({
        where: { id },
      });
      if (!existingProperties) {
        throw new NotFoundException(`Properties with ID ${id} not found`);
      }
      const updatedProperties = this.propertiesRepository.merge(
        existingProperties,
        updatePropertiesDto,
      );
      await this.propertiesRepository.save(updatedProperties);
      return updatedProperties;
    } catch (error) {
      throw error;
    }
  }

  async deletePropertiesById(id: number): Promise<unknown> {
    try {
      const existingProperties = await this.propertiesRepository.findOne({
        where: { id },
      });
      if (!existingProperties) {
        throw new NotFoundException(`Properties with ID ${id} not found`);
      }
      return await this.propertiesRepository.remove(existingProperties);
    } catch (error) {
      throw error;
    }
  }

  async compareAndUpdateProperties(): Promise<CommonPropertiesResponseDto[]> {
    const updatedProperties: CommonPropertiesResponseDto[] = [];
    const username = 'invoice@fraxioned.com';
    const password = 'pt_82y3fsmphj7gc0kze0u0p16gp2yn6pap';

    const response = await axios.get('https://api.ownerrez.com/v2/properties', {
      auth: {
        username,
        password,
      },
    });
    const externalProperties: ComparePropertiesDto = response.data;

    for (const item of externalProperties.items) {
      const existingProperty = await this.propertiesRepository.findOne({
        where: { ownerRezPropId: item.id },
      });

      if (existingProperty) {
        const existingPropertyDetails =
          await this.propertyDetailsRepository.findOne({
            where: { property: { id: existingProperty.id } },
          });

        if (existingPropertyDetails) {
          if (existingProperty.address !== item.address.street1) {
            existingProperty.address = item.address.street1;
          }
          if (existingProperty.city !== item.address.city) {
            existingProperty.city = item.address.city;
          }
          if (existingProperty.state !== item.address.state) {
            existingProperty.state = item.address.state;
          }
          if (existingProperty.country !== item.address.country) {
            existingProperty.country = item.address.country;
          }
          if (existingProperty.zipcode !== item.address.postal_code) {
            existingProperty.zipcode = item.address.postal_code;
          }
          if (existingProperty.latitude !== item.latitude) {
            existingProperty.latitude = item.latitude;
          }
          if (existingProperty.longitude !== item.longitude) {
            existingProperty.longitude = item.longitude;
          }
          if (existingProperty.displayOrder !== item.display_order) {
            existingProperty.displayOrder = item.display_order;
          }
          if (existingProperty.isActive !== item.active) {
            existingProperty.isActive = item.active;
          }
          if (existingPropertyDetails.noOfBathrooms !== item.bathrooms) {
            existingPropertyDetails.noOfBathrooms = item.bathrooms;
          }
          if (
            existingPropertyDetails.noOfBathroomsFull !== item.bathrooms_full
          ) {
            existingPropertyDetails.noOfBathroomsFull = item.bathrooms_full;
          }
          if (
            existingPropertyDetails.noOfBathroomsHalf !== item.bathrooms_half
          ) {
            existingPropertyDetails.noOfBathroomsHalf = item.bathrooms_half;
          }
          if (existingPropertyDetails.noOfBedrooms !== item.bedrooms) {
            existingPropertyDetails.noOfBedrooms = item.bedrooms;
          }
          if (existingPropertyDetails.noOfGuestsAllowed !== item.max_guests) {
            existingPropertyDetails.noOfGuestsAllowed = item.max_guests;
          }
          if (existingPropertyDetails.noOfPetsAllowed !== item.max_pets) {
            existingPropertyDetails.noOfPetsAllowed = item.max_pets;
          }

          await this.propertiesRepository.save(existingProperty);
          await this.propertyDetailsRepository.save(existingPropertyDetails);

          updatedProperties.push(existingProperty);
        }
      }
    }

    return updatedProperties;
  }

  async getAllProperties(
    userId: number,
  ): Promise<CommonPropertiesResponseDto[]> {
    try {
      const existingProperties = await this.propertiesRepository.find({
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
      if (existingProperties.length === 0) {
        throw new NotFoundException(`Properties not found`);
      }
      return Promise.all(
        existingProperties.map((property) =>
          this.setPropertyName(property, userId),
        ),
      );
    } catch (error) {
      throw error;
    }
  }

  async getPropertiesById(
    id: number,
    userId: number,
  ): Promise<CommonPropertiesResponseDto> {
    try {
      const existingProperties = await this.propertiesRepository.findOne({
        where: { id },
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
      if (!existingProperties) {
        throw new NotFoundException(`Properties with ID ${id} not found`);
      }
      return this.setPropertyName(existingProperties, userId);
    } catch (error) {
      throw error;
    }
  }

  async getPropertiesWithDetails(
    id?: number,
    requestedUser?: number,
  ): Promise<
    PropertyWithDetailsResponseDto | PropertyWithDetailsResponseDto[] | object
  > {
    try {
      if (id) {
        const property = await this.propertiesRepository.findOne({
          where: { id },
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

        if (!property) {
          return USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(id);
        }

        const propertyDetails = await this.propertyDetailsRepository.findOne({
          where: { property: { id: id } },
        });

        if (!propertyDetails) {
          return USER_PROPERTY_RESPONSES.PROPERTY_DETAIL_NOT_FOUND(id);
        }

        const userProperties = await this.userPropertiesRepository.find({
          where: { property: { id: id } },
          relations: ['user'],
        });

        const uniqueUsers = new Map();
        userProperties.forEach((userProperty) => {
          if (!uniqueUsers.has(userProperty.user.id)) {
            uniqueUsers.set(userProperty.user.id, {
              user: userProperty.user,
              noOfShare: userProperty.noOfShare,
              acquisitionDate: userProperty.acquisitionDate,
            });
          }
        });

        const { id: propertyId, ...propertyWithoutId } =
          await this.setPropertyName(property, requestedUser);
        const { id: propertyDetailsId, ...propertyDetailsWithoutId } =
          propertyDetails;

        return {
          propertyId,
          propertyDetailsId,
          ...propertyWithoutId,
          ...propertyDetailsWithoutId,
          owners: Array.from(uniqueUsers.values()).map(
            ({ user, noOfShare, acquisitionDate }) => ({
              userId: user.id,
              noOfShare,
              acquisitionDate,
            }),
          ),
        };
      } else {
        const properties = await this.propertiesRepository.find({
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

        if (!properties.length) {
          return USER_PROPERTY_RESPONSES.PROPERTIES_NOT_FOUND;
        }

        const propertiesWithDetails = await Promise.all(
          properties.map(async (property) => {
            const propertyDetails =
              await this.propertyDetailsRepository.findOne({
                where: { property: { id: property.id } },
              });

            const userProperties = await this.userPropertiesRepository.find({
              where: { property: { id: property.id } },
              relations: ['user'],
            });

            const uniqueUsers = new Map();
            userProperties.forEach((userProperty) => {
              if (!uniqueUsers.has(userProperty.user.id)) {
                uniqueUsers.set(userProperty.user.id, {
                  user: userProperty.user,
                  noOfShare: userProperty.noOfShare,
                  acquisitionDate: userProperty.acquisitionDate,
                });
              }
            });

            property = await this.setPropertyName(property, requestedUser);

            if (!propertyDetails) {
              return {
                propertyId: property.id,
                propertyDetailsId: null,
                ...property,
                owners: Array.from(uniqueUsers.values()).map(
                  ({ user, noOfShare, acquisitionDate }) => ({
                    userId: user.id,
                    noOfShare,
                    acquisitionDate,
                  }),
                ),
              };
            }

            const { id: propertyId, ...propertyWithoutId } = property;
            const { id: propertyDetailsId, ...propertyDetailsWithoutId } =
              propertyDetails;

            return {
              propertyId,
              propertyDetailsId,
              ...propertyWithoutId,
              ...propertyDetailsWithoutId,
              owners: Array.from(uniqueUsers.values()).map(
                ({ user, noOfShare, acquisitionDate }) => ({
                  userId: user.id,
                  noOfShare,
                  acquisitionDate,
                }),
              ),
            };
          }),
        );
        return propertiesWithDetails;
      }
    } catch (error) {
      throw error;
    }
  }
  async getAllPropertiesWithDetailsByUser(
    userId: number,
    requestedUser: number,
  ): Promise<UserPropertyWithDetailsResponseDto[] | object> {
    try {
      const userExists = await this.userRepository.exists({
        where: { id: userId },
      });
      if (!userExists) {
        return USER_RESPONSES.USER_NOT_FOUND(userId);
      }

      const userProperties = await this.userPropertiesRepository.find({
        where: { user: { id: userId } },
        relations: ['property', 'user'],
      });

      if (!userProperties.length) {
        return USER_PROPERTY_RESPONSES.USER_PROPERTY_NOT_FOUND(userId);
      }

      const propertyMap = new Map<number, PropertyWithDetails>();

      await Promise.all(
        userProperties.map(async (userProperty) => {
          const propertyDetails = await this.propertyDetailsRepository.findOne({
            where: { property: { id: userProperty.property.id } },
          });

          userProperty.property = await this.setPropertyName(
            userProperty.property,
            requestedUser,
          );

          const {
            property: { id: propertyId, ...propertyWithoutId },
            ...userPropertyWithoutId
          } = userProperty;

          const { user, ...userPropertyWithoutUser } = userPropertyWithoutId;
          if (!user) {
            return USER_RESPONSES.USER_NOT_FOUND(user.id);
          }
          if (!propertyDetails) {
            if (!propertyMap.has(propertyId)) {
              propertyMap.set(propertyId, {
                propertyId,
                propertyDetailsId: null,
                ...propertyWithoutId,
                userProperties: [],
              });
            }
            propertyMap
              .get(propertyId)!
              .userProperties.push(userPropertyWithoutUser);
            return;
          }

          const { id: propertyDetailsId, ...propertyDetailsWithoutId } =
            propertyDetails;

          if (!propertyMap.has(propertyId)) {
            propertyMap.set(propertyId, {
              propertyId,
              propertyDetailsId,
              ...propertyWithoutId,
              ...propertyDetailsWithoutId,
              userProperties: [],
            });
          }
          propertyMap
            .get(propertyId)!
            .userProperties.push(userPropertyWithoutUser);
        }),
      );

      return Array.from(propertyMap.values());
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'An error occurred while fetching properties with details for the user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
