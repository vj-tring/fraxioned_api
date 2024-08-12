import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePropertiesDto } from 'src/main/dto/requests/create-property.dto';
import { UpdatePropertiesDto } from 'src/main/dto/requests/update-properties.dto';
import { CommonPropertiesResponseDto } from 'src/main/dto/responses/common-properties.dto';
import { CreatePropertiesResponseDto } from 'src/main/dto/responses/create-properties.dto';
import { UpdatePropertiesResponseDto } from 'src/main/dto/responses/update-properties.dto';
import { Property } from 'src/main/entities/Property.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
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
}
