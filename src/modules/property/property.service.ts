import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../owner-property/entity/property.entity';
import { Repository } from 'typeorm';
import { PropertyPhoto } from '../owner-property/entity/property-photo.entity';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(PropertyPhoto)
    private propertyPhotoRepository: Repository<PropertyPhoto>,
  ) {}

  async getPropertyDetailsById(propertyId: number): Promise<Property> {
    return this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.photos', 'photos')
      .where('property.id = :id', { id: propertyId })
      .getOne();
  }

  async getPropertyPhotosByPropertyId(
    propertyId: number,
  ): Promise<PropertyPhoto[]> {
    return this.propertyPhotoRepository.find({
      where: { property: { id: propertyId } },
    });
  }
}
