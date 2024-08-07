import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoggerService } from './logger.service';
import { Properties } from '../entities/properties.entity';
import { PropertyAmenities } from '../entities/property_amenities.entity';
import { Amenities } from '../entities/amenities.entity';
import { CreatePropertyAmenitiesDto } from '../dto/requests/create-property-amenities.dto';
import { PROPERTY_AMENITY_RESPONSES } from '../commons/constants/response-constants/property-amenities.constant';
import { UpdatePropertyAmenitiesDto } from '../dto/requests/update-property-amenities.dto';

@Injectable()
export class PropertyAmenitiesService {
  constructor(
    @InjectRepository(PropertyAmenities)
    private readonly propertyAmenitiesRepository: Repository<PropertyAmenities>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Amenities)
    private readonly amenityRepository: Repository<Amenities>,
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    private readonly logger: LoggerService,
  ) {}

  async createPropertyAmenity(
    createPropertyAmenityDto: CreatePropertyAmenitiesDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyAmenities;
    statusCode: number;
  }> {
    try {
      this.logger.log(
        `Creating mapping for property ${createPropertyAmenityDto.property.id} to the amenity ${createPropertyAmenityDto.amenity.id}`,
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
        return PROPERTY_AMENITY_RESPONSES.PROPERTY_NOT_FOUND(
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
        return PROPERTY_AMENITY_RESPONSES.AMENITY_NOT_FOUND(
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
        return PROPERTY_AMENITY_RESPONSES.USER_NOT_FOUND(
          createPropertyAmenityDto.createdBy.id,
        );
      }

      const existingPropertyAmenity =
        await this.propertyAmenitiesRepository.findOne({
          where: {
            property: {
              id: createPropertyAmenityDto.property.id,
            },
            amenity: {
              id: createPropertyAmenityDto.amenity.id,
            },
          },
        });

      if (existingPropertyAmenity) {
        this.logger.error(
          `Error creating property amenity: Property ID ${createPropertyAmenityDto.property.id} with Amenity ID ${createPropertyAmenityDto.amenity.id} already exists`,
        );
        return PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_ALREADY_EXISTS(
          createPropertyAmenityDto.property.id,
          createPropertyAmenityDto.amenity.id,
        );
      }

      const propertyAmenity = this.propertyAmenitiesRepository.create({
        ...createPropertyAmenityDto,
      });
      const savedPropertyAmenity =
        await this.propertyAmenitiesRepository.save(propertyAmenity);
      this.logger.log(
        `Property Amenity with property ID ${createPropertyAmenityDto.property.id} and amenity ID ${createPropertyAmenityDto.amenity.id} created successfully`,
      );
      return PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_CREATED(
        savedPropertyAmenity,
        savedPropertyAmenity.id,
      );
    } catch (error) {
      this.logger.error(
        `Error creating property amenity: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the property amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllPropertySAmenities(): Promise<{
    success: boolean;
    message: string;
    data?: PropertyAmenities[];
    statusCode: number;
  }> {
    try {
      const propertyAmenities = await this.propertyAmenitiesRepository.find({
        relations: ['property', 'amenity', 'createdBy', 'updatedBy'],
        select: {
          property: {
            id: true,
          },
          amenity: {
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

      if (propertyAmenities.length === 0) {
        this.logger.log(`No property amenities are available`);

        return PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITIES_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${propertyAmenities.length} amenities successfully.`,
      );

      return PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITIES_FETCHED(
        propertyAmenities,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property amenities: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the property amenities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPropertyAmenityById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertyAmenities;
    statusCode: number;
  }> {
    try {
      const propertyAmenity = await this.propertyAmenitiesRepository.findOne({
        relations: ['property', 'amenity', 'createdBy', 'updatedBy'],
        select: {
          property: {
            id: true,
          },
          amenity: {
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

      if (!propertyAmenity) {
        this.logger.error(`Property Amenity with ID ${id} not found`);
        return PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_NOT_FOUND(id);
      }
      this.logger.log(`Property Amenity with ID ${id} retrieved successfully`);
      return PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_FETCHED(
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

  async updatePropertyAmenityHoliday(
    id: number,
    updatePropertyAmenitiesDto: UpdatePropertyAmenitiesDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyAmenities;
    statusCode: number;
  }> {
    try {
      const propertyAmenity = await this.propertyAmenitiesRepository.findOne({
        relations: ['property', 'amenity', 'createdBy', 'updatedBy'],
        select: {
          property: {
            id: true,
          },
          amenity: {
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

      if (!propertyAmenity) {
        this.logger.error(`Property Amenity with ID ${id} does not exist`);
        return PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_NOT_FOUND(id);
      }

      const user = await this.usersRepository.findOne({
        where: {
          id: updatePropertyAmenitiesDto.updatedBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${updatePropertyAmenitiesDto.updatedBy.id} does not exist`,
        );
        return PROPERTY_AMENITY_RESPONSES.USER_NOT_FOUND(
          updatePropertyAmenitiesDto.updatedBy.id,
        );
      }

      if (
        updatePropertyAmenitiesDto.property &&
        updatePropertyAmenitiesDto.property.id
      ) {
        const property = await this.propertiesRepository.findOne({
          where: { id: updatePropertyAmenitiesDto.property.id },
        });
        if (!property) {
          this.logger.error(
            `Property with ID ${updatePropertyAmenitiesDto.property.id} does not exist`,
          );
          return PROPERTY_AMENITY_RESPONSES.PROPERTY_NOT_FOUND(
            updatePropertyAmenitiesDto.property.id,
          );
        }
      }

      if (
        updatePropertyAmenitiesDto.amenity &&
        updatePropertyAmenitiesDto.amenity.id
      ) {
        const amenity = await this.amenityRepository.findOne({
          where: { id: updatePropertyAmenitiesDto.amenity.id },
        });
        if (!amenity) {
          this.logger.error(
            `Amenity with ID ${updatePropertyAmenitiesDto.amenity.id} does not exist`,
          );
          return PROPERTY_AMENITY_RESPONSES.AMENITY_NOT_FOUND(
            updatePropertyAmenitiesDto.amenity.id,
          );
        }
      }

      Object.assign(propertyAmenity, updatePropertyAmenitiesDto);
      const updatedPropertyAmenity =
        await this.propertyAmenitiesRepository.save(propertyAmenity);

      this.logger.log(`Property Amenity with ID ${id} updated successfully`);

      return PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_UPDATED(
        updatedPropertyAmenity,
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error updating property amenity with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the property amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removePropertyAmenity(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const result = await this.propertyAmenitiesRepository.delete(id);

      if (result.affected === 0) {
        this.logger.error(`Property Amenity with ID ${id} not found`);
        return PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_NOT_FOUND(id);
      }
      this.logger.log(`Property Amenity with ID ${id} deleted successfully`);
      return PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_DELETED(id);
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
