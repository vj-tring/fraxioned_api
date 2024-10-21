import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from 'src/main/entities/property.entity';
import { PropertyDetails } from 'src/main/entities/property-details.entity';

@Injectable()
export class PropertyRepository {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyDetails)
    private readonly propertyDetailsRepository: Repository<PropertyDetails>,
  ) {}

  async findProperty(id: number): Promise<Property | undefined> {
    return this.propertyRepository.findOne({
      where: { id },
    });
  }

  async findPropertyDetails(id: number): Promise<PropertyDetails | undefined> {
    return this.propertyDetailsRepository.findOne({
      where: { id },
    });
  }

  async saveProperty(property: Property): Promise<Property> {
    return this.propertyRepository.save(property);
  }
}
