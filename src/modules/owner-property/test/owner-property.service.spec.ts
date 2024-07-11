import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnerPropertyService } from '../owner-property.service';
import { Property } from '../entity/property.entity';
import { PropertyPhoto } from '../entity/property-photo.entity';
import { OwnerProperty } from '../entity/owner-property.entity';
import { OwnerPropertyDetail } from '../entity/owner-property-detail.entity';


describe('OwnerPropertyService', () => {
  let service: OwnerPropertyService;
  let propertyRepository: Repository<Property>;
  let ownerPropertyRepository: Repository<OwnerProperty>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let ownerPropertyDetailRepository: Repository<OwnerPropertyDetail>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnerPropertyService,
        {
          provide: getRepositoryToken(Property),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PropertyPhoto),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(OwnerProperty),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(OwnerPropertyDetail),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OwnerPropertyService>(OwnerPropertyService);
    propertyRepository = module.get<Repository<Property>>(
      getRepositoryToken(Property),
    );
    ownerPropertyRepository = module.get<Repository<OwnerProperty>>(
      getRepositoryToken(OwnerProperty),
    );
    ownerPropertyDetailRepository = module.get<Repository<OwnerPropertyDetail>>(
      getRepositoryToken(OwnerPropertyDetail),
    );
  });

  describe('getOwnerProperties', () => {
    it('should return an array of owner properties', async () => {
      const ownerProperties = [
        { property: { id: 1 }, noOfShare: 5 },
        { property: { id: 2 }, noOfShare: 10 },
      ];

      const properties = [
        { id: 1, name: 'Property 1', address: 'Address 1', photos: [] },
        { id: 2, name: 'Property 2', address: 'Address 2', photos: [] },
      ];

      jest
        .spyOn(ownerPropertyRepository, 'find')
        .mockResolvedValue(ownerProperties as any);
      jest
        .spyOn(propertyRepository, 'find')
        .mockResolvedValue(properties as any);

      const result = await service.getOwnerProperties(1);
      expect(result).toEqual([
        { property: properties[0], noOfShare: 5 },
        { property: properties[1], noOfShare: 10 },
      ]);
    });
  });

  describe('getOwnerPropertyDetailsByUserId', () => {
    it('should return an array of off-season property details', async () => {
      const properties = [
        {
          totalNights: 20,
          totalHolidayNights: 10,
          ownerProperties: [
            {
              ownerPropertyDetails: [
                {
                  OSUN: 5,
                  OSBN: 3,
                  OSRN: 2,
                  OSUHN: 2,
                  OSBHN: 3,
                  OSRHN: 5,
                },
              ],
            },
          ],
          propertySeasonDates: [
            { seasonId: 2, season_start: new Date(), season_end: new Date() },
          ],
        },
      ];

      jest.spyOn(propertyRepository, 'createQueryBuilder').mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(properties),
      } as any);

      const result = await service.getOwnerPropertyOffSeasonDetails(1);
      expect(result).toEqual([
        {
          totalNights: 20,
          nightsUsed: 5,
          nightsRemaining: 2,
          nightsBooked: 3,
          totalHolidayNights: 10,
          holidaysUsed: 2,
          holidaysRemaining: 5,
          holidaysBooked: 3,
          start_date: properties[0].propertySeasonDates[0].season_start,
          end_date: properties[0].propertySeasonDates[0].season_end,
          year: new Date().getFullYear(),
        },
      ]);
    });
  });

  describe('getOwnerPropertyDetailsPeakSeason', () => {
    it('should return an array of peak-season-renting property details', async () => {
      const properties = [
        {
          peakTotalNights: 15,
          propertySeasonDates: [
            { seasonId: 1, season_start: new Date(), season_end: new Date() },
          ],
        },
      ];

      jest.spyOn(propertyRepository, 'createQueryBuilder').mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(properties),
      } as any);

      jest.spyOn<any, any>(service, 'nightsStaying').mockReturnValue(5);
      jest.spyOn<any, any>(service, 'nightsRenting').mockReturnValue(3);
      jest.spyOn<any, any>(service, 'nightsUndecided').mockReturnValue(2);

      const result = await service.getOwnerPropertyPeakSeasonDetails(1);
      expect(result).toEqual([
        {
          peakTotalNights: 15,
          start_date: properties[0].propertySeasonDates[0].season_start,
          end_date: properties[0].propertySeasonDates[0].season_end,
          year: new Date().getFullYear(),
          night_staying: 5,
          night_renting: 3,
          nights_undecided: 2,
        },
      ]);
    });
  });

  describe('getPeakSeasonDetails', () => {
    it('should return an array of peak-season property details', async () => {
      const properties = [
        {
          totalNights: 20,
          totalHolidayNights: 10,
          ownerProperties: [
            {
              ownerPropertyDetails: [
                {
                 PSUN: 5,
                 PSBN: 3,
                 PSRN: 2,
                 PSUHN: 2,
                 PSBHN: 3,
                 PSRHN: 5,
                },
              ],
            },
          ],
          propertySeasonDates: [
            { seasonId: 2, season_start: new Date(), season_end: new Date() },
          ],
        },
      ];

      jest.spyOn(propertyRepository, 'createQueryBuilder').mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(properties),
      } as any);

      const result = await service.getPeakSeasonDetails(1);
      expect(result).toEqual([
        {
          totalNights: 20,
          nightsUsed: 5,
          nightsRemaining: 2,
          nightsBooked: 3,
          totalHolidayNights: 10,
          holidaysUsed: 2,
          holidaysRemaining: 5,
          holidaysBooked: 3,
          start_date: properties[0].propertySeasonDates[0].season_start,
          end_date: properties[0].propertySeasonDates[0].season_end,
          year: new Date().getFullYear(),
        },
      ]);
    });
  });
});
