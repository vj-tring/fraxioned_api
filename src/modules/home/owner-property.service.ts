import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Property } from './entity/property.entity';
import { PropertyPhoto } from './entity/property-photo.entity';
import { OwnerProperty } from './entity/owner-property.entity';
import { OwnerPropertyDetail } from './entity/owner-property-detail.entity';
import { OffSeasonDto } from './dto/off-season.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(PropertyPhoto)
    private propertyPhotoRepository: Repository<PropertyPhoto>,
    @InjectRepository(OwnerProperty)
    private ownerPropertyRepository: Repository<OwnerProperty>,
    @InjectRepository(OwnerPropertyDetail)
    private ownerPropertyDetailRepository: Repository<OwnerPropertyDetail>,
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

  async getOwnerProperties(userId: number): Promise<any[]> {
    const ownerProperties = await this.ownerPropertyRepository.find({
      where: { userId },
      relations: ['property'],
    });

    const propertyIds = ownerProperties.map((op) => op.property.id);

    const properties = await this.propertyRepository.find({
      where: { id: In(propertyIds) },
      relations: ['photos'],
      select: ['id', 'name', 'address'],
    });

    return ownerProperties.map((op) => ({
      property: properties.find((p) => p.id === op.property.id),
      noOfShare: op.noOfShare,
    }));
  }

  async getOwnerPropertyDetailsByUserId(
    userId: number,
  ): Promise<OffSeasonDto[]> {
    const properties = await this.propertyRepository
      .createQueryBuilder('property')
      .leftJoin('property.ownerProperties', 'ownerProperty')
      .leftJoin('ownerProperty.ownerPropertyDetails', 'ownerPropertyDetail')
      .where('ownerProperty.userId = :userId', { userId })
      .select([
        'property.totalNights',
        'property.totalHolidayNights',
        'ownerPropertyDetail.OSUN',
        'ownerPropertyDetail.OSBN',
        'ownerPropertyDetail.OSRN',
        'ownerPropertyDetail.OSUHN',
        'ownerPropertyDetail.OSBHN',
        'ownerPropertyDetail.OSRHN',
      ])
      .getMany();

    const offSeasonDtos: OffSeasonDto[] = properties.map((property) => {
      const ownerProperty = property.ownerProperties?.[0];
      const ownerPropertyDetail = ownerProperty?.ownerPropertyDetails?.[0];

      return {
        totalNights: property.totalNights,
        nightsUsed: ownerPropertyDetail?.OSUN || 0,
        nightsRemaining: ownerPropertyDetail?.OSRN || 0,
        nightsBooked: ownerPropertyDetail?.OSBN || 0,
        totalHolidayNights: property.totalHolidayNights,
        holidaysUsed: ownerPropertyDetail?.OSUHN || 0,
        holidaysRemaining: ownerPropertyDetail?.OSRHN || 0,
        holidaysBooked: ownerPropertyDetail?.OSBHN || 0,
      };
    });

    return offSeasonDtos;
  }
}
