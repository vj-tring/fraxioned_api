import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePropertyCodeDto } from '../dto/requests/property-code/create-property-code.dto';
import { UpdatePropertyCodeDto } from '../dto/requests/property-code/update-property-code.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyCodes } from '../entities/property_codes.entity';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';

@Injectable()
export class PropertyCodesService {
  constructor(
    @InjectRepository(PropertyCodes)
    private propertyCodesRepository: Repository<PropertyCodes>,
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
  ) {}
  async createPropertyCodes(
    createPropertyCodeDto: CreatePropertyCodeDto,
  ): Promise<object> {
    try {
      const existingProperties = await this.propertiesRepository.findOne({
        where: { id: createPropertyCodeDto.property as unknown as number },
      });

      if (!existingProperties) {
        throw new NotFoundException(
          `Properties with ID ${createPropertyCodeDto.property} not found`,
        );
      }
      const propertyCodes = this.propertyCodesRepository.create(
        createPropertyCodeDto,
      );
      const savedPropertyCodes =
        await this.propertyCodesRepository.save(propertyCodes);
      return savedPropertyCodes;
    } catch (error) {
      throw error;
    }
  }

  async getAllPropertyCodes(): Promise<object[]> {
    try {
      const existingPropertyCodes = await this.propertyCodesRepository.find({
        relations: ['property', 'createdBy', 'updatedBy'],
        select: {
          property: {
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
      if (!existingPropertyCodes) {
        throw new NotFoundException('Property Codes not found');
      }
      return existingPropertyCodes;
    } catch (error) {
      throw error;
    }
  }

  async getPropertyCodesById(id: number): Promise<object> {
    try {
      const existingPropertyCodes = await this.propertyCodesRepository.findOne({
        where: { id },
        relations: ['property', 'createdBy', 'updatedBy'],
        select: {
          property: {
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
      if (!existingPropertyCodes) {
        throw new NotFoundException(`Property Codes with ID ${id} not found`);
      }
      return existingPropertyCodes;
    } catch (error) {
      throw error;
    }
  }

  async updatePropertyCodesById(
    id: number,
    updatePropertyCodeDto: UpdatePropertyCodeDto,
  ): Promise<object> {
    try {
      const existingPropertyCodes = await this.propertyCodesRepository.findOne({
        where: { id },
        relations: ['createdBy', 'property', 'updatedBy'],
      });
      if (!existingPropertyCodes) {
        throw new NotFoundException(`Property Codes with ID ${id} not found`);
      }
      if (
        existingPropertyCodes.property.id !=
        (updatePropertyCodeDto.property.id |
          (updatePropertyCodeDto.property as unknown as number))
      ) {
        throw new BadRequestException('Property ID does not match');
      }
      const updatedPropertyCodes = this.propertyCodesRepository.merge(
        existingPropertyCodes,
        updatePropertyCodeDto,
      );
      await this.propertyCodesRepository.save(updatedPropertyCodes);
      return updatedPropertyCodes;
    } catch (error) {
      throw error;
    }
  }

  async deletePropertyCodesById(id: number): Promise<unknown> {
    try {
      const existingPropertyCodes = await this.propertyCodesRepository.findOne({
        where: { id },
      });
      if (!existingPropertyCodes) {
        throw new NotFoundException(`Property Codes with ID ${id} not found`);
      }
      return await this.propertyCodesRepository.remove(existingPropertyCodes);
    } catch (error) {
      throw error;
    }
  }
}
