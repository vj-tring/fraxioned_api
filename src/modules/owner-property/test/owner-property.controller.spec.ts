import { Test, TestingModule } from '@nestjs/testing';
import { OwnerPropertyController } from '../owner-property.controller';
import { OwnerPropertyService } from '../owner-property.service';
import { Property } from '../entity/property.entity';
import { OffSeasonDto } from '../dto/off-season.dto';
import { PeakSeasonDto } from '../dto/peak-season.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyPhoto } from '../entity/property-photo.entity';
import { OwnerProperty } from '../entity/owner-property.entity';
import { OwnerPropertyDetail } from '../entity/owner-property-detail.entity';
import { validate } from 'class-validator';
import { PropertyDTO } from '../dto/property.dto';

describe('OwnerPropertyController', () => {
  let controller: OwnerPropertyController;
  let service: OwnerPropertyService;

  const mockPropertyService = {
    getOwnerProperties: jest.fn(),
    getOwnerPropertyDetailsByUserId: jest.fn(),
    getOwnerPropertyDetailsPeakSeason: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OwnerPropertyController],
      providers: [
        {
          provide: OwnerPropertyService,
          useValue: mockPropertyService,
        },
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

    controller = module.get<OwnerPropertyController>(OwnerPropertyController);
    service = module.get<OwnerPropertyService>(OwnerPropertyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('DTO Validation', () => {
    it('should validate OffSeasonDto', async () => {
      const dto = new OffSeasonDto();
      dto.totalNights = 10;
      dto.nightsUsed = 5;
      dto.nightsRemaining = 5;
      dto.nightsBooked = 0;
      dto.totalHolidayNights = 0;
      dto.holidaysUsed = 0;
      dto.holidaysRemaining = 0;
      dto.holidaysBooked = 0;
      dto.start_date = '2024-07-01';
      dto.end_date = '2024-07-10';
      dto.year = 2024;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate PeakSeasonDto', async () => {
      const dto = new PeakSeasonDto();
      dto.peakTotalNights = 10;
      dto.night_staying = 2;
      dto.start_date = '2024-07-01';
      dto.end_date = '2024-07-10';
      dto.year = 2024;
      dto.night_renting = 0;
      dto.nights_undecided = 0;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate PropertyDto', async () => {
      const dto = new PropertyDTO();
      dto.image = 'test';
      dto.name = 'test';
      dto.address = 'test address';
      dto.numberOfShares = 2;
      dto.totalShares = 8;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('getOwnerProperties', () => {
    it('should return an array of properties', async () => {
      const result = [
        {
          id: 1,
          name: 'Property 1',
          address: 'Address 1',
          photos: [],
          share: null,
          ownerProperties: [],
          propertySeasonDates: [],
          totalNights: 0,
          peakTotalNights: 0,
          totalHolidayNights: 0,
        },
        {
          id: 2,
          name: 'Property 2',
          address: 'Address 2',
          photos: [],
          share: null,
          ownerProperties: [],
          propertySeasonDates: [],
          totalNights: 0,
          peakTotalNights: 0,
          totalHolidayNights: 0,
        },
      ];
      jest.spyOn(service, 'getOwnerProperties').mockResolvedValue(result);

      expect(await controller.getOwnerProperties(1)).toBe(result);
    });
  });

  describe('getOwnerPropertyDetailsByUserId', () => {
    it('should return an array of off-season details', async () => {
      const result: OffSeasonDto[] = [
        {
          totalNights: 10,
          nightsUsed: 5,
          nightsRemaining: 0,
          nightsBooked: 0,
          totalHolidayNights: 0,
          holidaysUsed: 0,
          holidaysRemaining: 0,
          holidaysBooked: 0,
          start_date: '',
          end_date: '',
          year: 0,
        },
      ];
      jest
        .spyOn(service, 'getOwnerPropertyDetailsByUserId')
        .mockResolvedValue(result);

      expect(await controller.getOwnerPropertyDetailsByUserId(1)).toBe(result);
    });
  });

  describe('getOwnerPropertyDetailsPeakSeason', () => {
    it('should return an array of peak-season details', async () => {
      const result: PeakSeasonDto[] = [
        {
          peakTotalNights: 10,
          night_staying: 2,
          start_date: '',
          end_date: '',
          year: 0,
          night_renting: 0,
          nights_undecided: 0,
        },
      ];
      jest
        .spyOn(service, 'getOwnerPropertyDetailsPeakSeason')
        .mockResolvedValue(result);

      expect(await controller.getOwnerPropertyDetailsPeakSeason(1)).toBe(
        result,
      );
    });
  });
});