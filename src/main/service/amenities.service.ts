import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Amenities } from '../entities/amenities.entity';
import { CreateAmenitiesDto } from '../dto/requests/create-amenities.dto';
import { AMENITIES_RESPONSES } from '../commons/constants/response-constants/amenities.constant';
import { PropertyAmenities } from '../entities/property_amenities.entity';
import { UpdateAmenitiesDto } from '../dto/requests/update-amenities.dto';

@Injectable()
export class AmenitiesService {
  constructor(
    @InjectRepository(Amenities)
    private readonly amenityRepository: Repository<Amenities>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(PropertyAmenities)
    private readonly propertyAmenityRepository: Repository<PropertyAmenities>,
    private readonly logger: LoggerService,
  ) {}

  async createAmenity(createAmenityDto: CreateAmenitiesDto): Promise<{
    success: boolean;
    message: string;
    data?: Amenities;
    statusCode: number;
  }> {
    try {
      this.logger.log(
        `Creating amenity ${createAmenityDto.amenityName} for the type ${createAmenityDto.amenityType}`,
      );
      const existingAmenity = await this.amenityRepository.findOne({
        where: {
          amenityName: createAmenityDto.amenityName,
          amenityType: createAmenityDto.amenityType,
        },
      });
      if (existingAmenity) {
        this.logger.error(
          `Error creating amenity: Amenity ${createAmenityDto.amenityName} for the type ${createAmenityDto.amenityType} already exists`,
        );
        return AMENITIES_RESPONSES.AMENITY_ALREADY_EXISTS(
          createAmenityDto.amenityName,
          createAmenityDto.amenityType,
        );
      }

      const user = await this.usersRepository.findOne({
        where: {
          id: createAmenityDto.createdBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${createAmenityDto.createdBy.id} does not exist`,
        );
        return AMENITIES_RESPONSES.USER_NOT_FOUND(
          createAmenityDto.createdBy.id,
        );
      }

      const amenity = this.amenityRepository.create({
        ...createAmenityDto,
      });
      const savedAmenity = await this.amenityRepository.save(amenity);
      this.logger.log(
        `Amenity ${createAmenityDto.amenityName} created with ID ${savedAmenity.id}`,
      );
      return AMENITIES_RESPONSES.AMENITY_CREATED(
        savedAmenity,
        createAmenityDto.amenityName,
        savedAmenity.id,
      );
    } catch (error) {
      this.logger.error(
        `Error creating amenity: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllAmenities(): Promise<{
    success: boolean;
    message: string;
    data?: Amenities[];
    statusCode: number;
  }> {
    try {
      const amenities = await this.amenityRepository.find({
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

      if (amenities.length === 0) {
        this.logger.log(`No amenities are available`);
        return AMENITIES_RESPONSES.AMENITIES_NOT_FOUND();
      }

      this.logger.log(`Retrieved ${amenities.length} amenities successfully.`);
      return AMENITIES_RESPONSES.AMENITIES_FETCHED(amenities);
    } catch (error) {
      this.logger.error(
        `Error retrieving amenities: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the amenities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAmenityById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: Amenities;
    statusCode: number;
  }> {
    try {
      const amenity = await this.amenityRepository.findOne({
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

      if (!amenity) {
        this.logger.error(`Amenity with ID ${id} not found`);
        return AMENITIES_RESPONSES.AMENITY_NOT_FOUND(id);
      }

      this.logger.log(`Amenity with ID ${id} retrieved successfully`);
      return AMENITIES_RESPONSES.AMENITY_FETCHED(amenity, id);
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

  async updateAmenityDetailById(
    id: number,
    updateAmenitiesDto: UpdateAmenitiesDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: Amenities;
    statusCode: number;
  }> {
    try {
      const amenity = await this.amenityRepository.findOne({
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
      if (!amenity) {
        this.logger.error(`Amenity with ID ${id} not found`);
        return AMENITIES_RESPONSES.AMENITY_NOT_FOUND(id);
      }
      const user = await this.usersRepository.findOne({
        where: {
          id: updateAmenitiesDto.updatedBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${updateAmenitiesDto.updatedBy.id} does not exist`,
        );
        return AMENITIES_RESPONSES.USER_NOT_FOUND(
          updateAmenitiesDto.updatedBy.id,
        );
      }
      Object.assign(amenity, updateAmenitiesDto);
      const updatedAmenity = await this.amenityRepository.save(amenity);
      this.logger.log(`Amenity with ID ${id} updated successfully`);
      return AMENITIES_RESPONSES.AMENITY_UPDATED(updatedAmenity, id);
    } catch (error) {
      this.logger.error(
        `Error updating amenity with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteAmenityById(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const propertyAmenity = await this.propertyAmenityRepository.findOne({
        where: { amenity: { id: id } },
      });
      if (propertyAmenity) {
        this.logger.log(
          `Amenity ID ${id} exists and is mapped to property, hence cannot be deleted.`,
        );
        return AMENITIES_RESPONSES.AMENITY_FOREIGN_KEY_CONFLICT(id);
      }
      const result = await this.amenityRepository.delete(id);
      if (result.affected === 0) {
        this.logger.error(`Amenity with ID ${id} not found`);
        return AMENITIES_RESPONSES.AMENITY_NOT_FOUND(id);
      }
      this.logger.log(`Amenity with ID ${id} deleted successfully`);
      return AMENITIES_RESPONSES.AMENITY_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting amenity with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}