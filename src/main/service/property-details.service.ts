import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyDetails } from '../entities/property-details.entity';
import { Repository } from 'typeorm';
import { CreatePropertyDetailsDto } from '../dto/requests/property-details/create-property-details.dto';
import { UpdatePropertyDetailsDto } from '../dto/requests/property-details/update-property-details.dto';
import { Property } from '../entities/property.entity';
import { CreatePropertyDetailsResponseDto } from '../dto/responses/create-property-details.dto';
import { UpdatePropertyDetailsResponseDto } from '../dto/responses/update-property-details.dto';

@Injectable()
export class PropertyDetailsService {
  constructor(
    @InjectRepository(PropertyDetails)
    private propertyDetailsRepository: Repository<PropertyDetails>,
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
  ) {}

  async createPropertyDetails(
    createPropertyDetailsDto: CreatePropertyDetailsDto,
  ): Promise<CreatePropertyDetailsResponseDto> {
    try {
      const existingProperties = await this.propertiesRepository.findOne({
        where: { id: createPropertyDetailsDto.property.id },
      });

      if (!existingProperties) {
        throw new NotFoundException(
          `Properties with ID ${createPropertyDetailsDto.property.id} not found`,
        );
      }

      const propertyDetails = this.propertyDetailsRepository.create(
        createPropertyDetailsDto,
      );

      const savedPropertyDetails =
        await this.propertyDetailsRepository.save(propertyDetails);
      return savedPropertyDetails;
    } catch (error) {
      throw error;
    }
  }

  async getAllPropertyDetails(): Promise<object[]> {
    try {
      const existingPropertyDetails = await this.propertyDetailsRepository.find(
        {
          relations: ['createdBy', 'updatedBy'],
          select: {
            createdBy: {
              id: true,
            },
            updatedBy: {
              id: true,
            },
          },
        },
      );
      if (existingPropertyDetails.length === 0) {
        throw new NotFoundException(`Property Details not found`);
      }
      return existingPropertyDetails;
    } catch (error) {
      throw error;
    }
  }

  async getPropertyDetailsById(id: number): Promise<object> {
    try {
      const existingPropertyDetails =
        await this.propertyDetailsRepository.findOne({
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
      if (!existingPropertyDetails) {
        throw new NotFoundException(`Property Details with ID ${id} not found`);
      }
      return existingPropertyDetails;
    } catch (error) {
      throw error;
    }
  }

  async updatePropertyDetailsById(
    id: number,
    updatePropertyDetailsDto: UpdatePropertyDetailsDto,
  ): Promise<UpdatePropertyDetailsResponseDto> {
    try {
      const existingPropertyDetails =
        await this.propertyDetailsRepository.findOne({
          where: { id },
          relations: ['createdBy', 'property', 'updatedBy'],
        });
      if (!existingPropertyDetails) {
        throw new NotFoundException(`Property Details with ID ${id} not found`);
      }
      if (
        existingPropertyDetails.property.id !=
        updatePropertyDetailsDto.property.id
      ) {
        throw new BadRequestException('Property ID does not match');
      }
      const updatedPropertyDetails = this.propertyDetailsRepository.merge(
        existingPropertyDetails,
        updatePropertyDetailsDto,
      );
      await this.propertyDetailsRepository.save(updatedPropertyDetails);
      return updatedPropertyDetails;
    } catch (error) {
      throw error;
    }
  }

  async deletePropertyDetailsById(id: number): Promise<unknown> {
    try {
      const existingPropertyDetails =
        await this.propertyDetailsRepository.findOne({
          where: { id },
        });
      if (!existingPropertyDetails) {
        throw new NotFoundException(`Property Details with ID ${id} not found`);
      }
      return await this.propertyDetailsRepository.remove(
        existingPropertyDetails,
      );
    } catch (error) {
      throw error;
    }
  }
}
