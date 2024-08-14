import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePropertiesDto } from 'src/main/dto/requests/create-property.dto';
import { UpdatePropertiesDto } from 'src/main/dto/requests/update-properties.dto';
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

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    @InjectRepository(PropertyDetails)
    private propertyDetailsRepository: Repository<PropertyDetails>,
    @InjectRepository(UserProperties)
    private userPropertiesRepository: Repository<UserProperties>,
  ) {}

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

  async getAllProperties(): Promise<CommonPropertiesResponseDto[]> {
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
      return existingProperties;
    } catch (error) {
      throw error;
    }
  }

  async getPropertiesById(id: number): Promise<CommonPropertiesResponseDto> {
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
      return existingProperties;
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

    // Basic Auth credentials
    const username = 'invoice@fraxioned.com';
    const password = 'pt_82y3fsmphj7gc0kze0u0p16gp2yn6pap';

    // Fetch data from the ownerRez Property API with Basic Auth
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
          // Update only similar columns
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

  async getPropertyWithDetailsById(
    id: number,
  ): Promise<PropertyWithDetailsResponseDto | object> {
    try {
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

      const { id: propertyId, ...propertyWithoutId } = property;
      const { id: propertyDetailsId, ...propertyDetailsWithoutId } =
        propertyDetails;

      return {
        propertyId,
        propertyDetailsId,
        ...propertyWithoutId,
        ...propertyDetailsWithoutId,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllPropertiesWithDetails(): Promise<
    PropertyWithDetailsResponseDto | object
  > {
    try {
      const properties = await this.propertiesRepository.find();

      if (!properties.length) {
        return USER_PROPERTY_RESPONSES.PROPERTIES_NOT_FOUND;
      }

      const propertiesWithDetails = await Promise.all(
        properties.map(async (property) => {
          const propertyDetails = await this.propertyDetailsRepository.findOne({
            where: { property: { id: property.id } },
          });

          if (!propertyDetails) {
            return {
              propertyId: property.id,
              propertyDetailsId: null,
              ...property,
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
          };
        }),
      );

      return propertiesWithDetails;
    } catch (error) {
      throw error;
    }
  }

  async getAllPropertiesWithDetailsByUser(
    userId: number,
  ): Promise<UserPropertyWithDetailsResponseDto[] | object> {
    try {
      const userProperties = await this.userPropertiesRepository.find({
        where: { user: { id: userId } },
        relations: ['property'],
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

          const {
            property: { id: propertyId, ...propertyWithoutId },
            ...userPropertyWithoutId
          } = userProperty;

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
              .userProperties.push(userPropertyWithoutId);
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
            .userProperties.push(userPropertyWithoutId);
        }),
      );

      return Array.from(propertyMap.values());
    } catch (error) {
      throw error;
    }
  }
}
