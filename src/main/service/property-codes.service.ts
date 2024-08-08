import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyCodeDto } from '../dto/requests/create-property-code.dto';
import { UpdatePropertyCodeDto } from '../dto/requests/update-property-code.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyCodes } from '../entities/property_codes.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PropertyCodesService {
  constructor(
    @InjectRepository(PropertyCodes)
    private propertyCodesRepository: Repository<PropertyCodes>,
  ) {}
  async createPropertyCodes(
    createPropertyCodeDto: CreatePropertyCodeDto,
  ): Promise<object> {
    try {
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
      });
      if (!existingPropertyCodes) {
        throw new NotFoundException(`Property Codes with ID ${id} not found`);
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
