import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePropertiesDto } from 'src/dto/requests/create-properties.dto';
import { UpdatePropertiesDto } from 'src/dto/requests/update-properties.dto';
import { CommonPropertiesResponseDto } from 'src/dto/responses/common-properties.dto';
import { CreatePropertiesResponseDto } from 'src/dto/responses/create-properties.dto';
import { UpdatePropertiesResponseDto } from 'src/dto/responses/update-properties.dto';
import { Properties } from 'src/entities/properties.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Properties)
    private propertiesRepository: Repository<Properties>,
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
