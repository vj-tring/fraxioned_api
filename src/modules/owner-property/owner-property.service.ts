import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Property } from './entity/property.entity';
import { PropertyPhoto } from './entity/property-photo.entity';
import { OwnerProperty } from './entity/owner-property.entity';
import { OwnerPropertyDetail } from './entity/owner-property-detail.entity';
import { OffSeasonDto } from './dto/off-season.dto';
import { PeakSeasonRentingDto } from './dto/peak-season-renting.dto';
import { PeakSeasonDto } from './dto/peak-season.dto';

@Injectable()
export class OwnerPropertyService {
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

  async getOwnerPropertyOffSeasonDetails(
    userId: number,
  ): Promise<OffSeasonDto[]> {
    const properties = await this.propertyRepository
      .createQueryBuilder('property')
      .innerJoin('property.ownerProperties', 'ownerProperty')
      .innerJoin('ownerProperty.ownerPropertyDetails', 'ownerPropertyDetail')
      .innerJoin('property.propertySeasonDates', 'propertySeasonDate')
      .where('ownerProperty.userId = :userId', { userId })
      .select([
        'property.id',
        'property.totalNights',
        'property.totalHolidayNights',
        'ownerPropertyDetail.OSUN',
        'ownerPropertyDetail.OSBN',
        'ownerPropertyDetail.OSRN',
        'ownerPropertyDetail.OSUHN',
        'ownerPropertyDetail.OSBHN',
        'ownerPropertyDetail.OSRHN',
        'propertySeasonDate.season_start',
        'propertySeasonDate.season_end',
      ])
      .getMany();

    const offSeasonDtos: OffSeasonDto[] = properties.map((property) => {
      const ownerProperty = property.ownerProperties?.[0];
      const ownerPropertyDetail = ownerProperty?.ownerPropertyDetails?.[0];
      const propertySeasonDate = property.propertySeasonDates?.[0];

      if (propertySeasonDate && propertySeasonDate.seasonId === 2) {
        new Date(propertySeasonDate.season_start);
        new Date(propertySeasonDate.season_end);
      }

      return {
        propertyId: property.id,
        totalNights: property.totalNights,
        nightsUsed: ownerPropertyDetail?.OSUN || 0,
        nightsRemaining: ownerPropertyDetail?.OSRN || 0,
        nightsBooked: ownerPropertyDetail?.OSBN || 0,
        totalHolidayNights: property.totalHolidayNights,
        holidaysUsed: ownerPropertyDetail?.OSUHN || 0,
        holidaysRemaining: ownerPropertyDetail?.OSRHN || 0,
        holidaysBooked: ownerPropertyDetail?.OSBHN || 0,
        start_date: propertySeasonDate?.season_start,
        end_date: propertySeasonDate?.season_end,
        year: new Date().getFullYear(),
      };
    });

    return offSeasonDtos;
  }

  async getOwnerPropertyPeakSeasonDetails(
    userId: number,
  ): Promise<PeakSeasonRentingDto[]> {
    const properties = await this.propertyRepository
      .createQueryBuilder('property')
      .innerJoin('property.ownerProperties', 'ownerProperty')
      .innerJoin('property.propertySeasonDates', 'propertySeasonDate')
      .where('ownerProperty.userId = :userId', { userId })
      .select([
        'property.id',
        'property.peakTotalNights',
        'propertySeasonDate.season_start',
        'propertySeasonDate.season_end',
      ])
      .getMany();

    const peakSeasonDtos: PeakSeasonRentingDto[] = properties.map((property) => {
      const propertySeasonDate = property.propertySeasonDates?.[0];

      if (propertySeasonDate && propertySeasonDate.seasonId === 1) {
        new Date(propertySeasonDate.season_start);
        new Date(propertySeasonDate.season_end);
      }

      const nightStaying = this.nightsStaying();
      const nightRenting = this.nightsRenting();
      const nightsUndecided = this.nightsUndecided(nightStaying, nightRenting);

      return {
        propertyId: property.id,
        start_date: propertySeasonDate.season_start,
        end_date: propertySeasonDate.season_end,
        peakTotalNights: property.peakTotalNights,
        year: new Date().getFullYear(),
        night_staying: nightStaying,
        night_renting: nightRenting,
        nights_undecided: nightsUndecided,
      };
    });
    return peakSeasonDtos;
  }

  async getPeakSeasonDetails(
    userId: number,
  ): Promise<PeakSeasonDto[]> {
    const properties = await this.propertyRepository
      .createQueryBuilder('property')
      .innerJoin('property.ownerProperties', 'ownerProperty')
      .innerJoin('ownerProperty.ownerPropertyDetails', 'ownerPropertyDetail')
      .innerJoin('property.propertySeasonDates', 'propertySeasonDate')
      .where('ownerProperty.userId = :userId', { userId })
      .select([
        'property.id',
        'property.totalNights',
        'property.totalHolidayNights',
        'ownerPropertyDetail.PSUN',
        'ownerPropertyDetail.PSBN',
        'ownerPropertyDetail.PSRN',
        'ownerPropertyDetail.PSUHN',
        'ownerPropertyDetail.PSBHN',
        'ownerPropertyDetail.PSRHN',
        'propertySeasonDate.season_start',
        'propertySeasonDate.season_end',
      ])
      .getMany();

    const peakSeasonDtos: PeakSeasonDto[] = properties.map((property) => {
      const ownerProperty = property.ownerProperties?.[0];
      const ownerPropertyDetail = ownerProperty?.ownerPropertyDetails?.[0];
      const propertySeasonDate = property.propertySeasonDates?.[0];

      if (propertySeasonDate && propertySeasonDate.seasonId === 2) {
        new Date(propertySeasonDate.season_start);
        new Date(propertySeasonDate.season_end);
      }

      return {
        propertyId: property.id,
        totalNights: property.totalNights,
        nightsUsed: ownerPropertyDetail?.PSUN || 0,
        nightsRemaining: ownerPropertyDetail?.PSRN || 0,
        nightsBooked: ownerPropertyDetail?.PSBN || 0,
        totalHolidayNights: property.totalHolidayNights,
        holidaysUsed: ownerPropertyDetail?.PSUHN || 0,
        holidaysRemaining: ownerPropertyDetail?.PSRHN || 0,
        holidaysBooked: ownerPropertyDetail?.PSBHN || 0,
        start_date: propertySeasonDate?.season_start,
        end_date: propertySeasonDate?.season_end,
        year: new Date().getFullYear(),
      };
    });

    return peakSeasonDtos;
  }

  // TODO : Need to remove random number generation and get Night Staying details from OwnerRez API
  private nightsStaying(): number {
    return Math.floor(Math.random() * 10) + 1;
  }

  // TODO : Need to remove random number generation and get Night Renting details from OwnerRez API
  private nightsRenting(): number {
    return Math.floor(Math.random() * 10) + 1;
  }

  private nightsUndecided(nightStaying: number, nightRenting: number): number {
    return nightStaying + nightRenting;
  }

}