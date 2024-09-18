import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Holidays } from 'src/main/entities/holidays.entity';
import { User } from 'src/main/entities/user.entity';
import { Role } from 'src/main/entities/role.entity';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { PropertySeasonHolidaysController } from 'src/main/controller/property-season-holidays.controller';
import { PropertySeasonHolidaysService } from 'src/main/service/property-season-holidays.service';
import { PropertySeasonHolidays } from 'src/main/entities/property-season-holidays.entity';
import { Property } from 'src/main/entities/property.entity';
import { PROPERTY_SEASON_HOLIDAY_RESPONSES } from 'src/main/commons/constants/response-constants/property-season-holidays.constants';
import { UpdatePropertySeasonHolidayDto } from 'src/main/dto/requests/property-season-holiday/update-property-season-holiday.dto';
import { CreatePropertySeasonHolidayDto } from 'src/main/dto/requests/property-season-holiday/create-property-season-holiday.dto';

describe('PropertySeasonHolidaysController', () => {
  let controller: PropertySeasonHolidaysController;
  let service: PropertySeasonHolidaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertySeasonHolidaysController],
      providers: [
        {
          provide: PropertySeasonHolidaysService,
          useValue: {
            createPropertySeasonHoliday: jest.fn(),
            findAllPropertySeasonHolidays: jest.fn(),
            findPropertySeasonHolidayById: jest.fn(),
            findHolidaysByPropertyId: jest.fn(),
            updatePropertySeasonHoliday: jest.fn(),
            removePropertySeasonHoliday: jest.fn(),
          },
        },
        {
          provide: AuthenticationService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<PropertySeasonHolidaysController>(
      PropertySeasonHolidaysController,
    );
    service = module.get<PropertySeasonHolidaysService>(
      PropertySeasonHolidaysService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const createPropertySeasonHolidayDto: CreatePropertySeasonHolidayDto = {
    property: {
      id: 1,
      propertyName: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipcode: 0,
      houseDescription: '',
      isExclusive: false,
      propertyShare: 0,
      createdBy: new User(),
      updatedBy: new User(),
      createdAt: undefined,
      updatedAt: undefined,
      ownerRezPropId: 0,
      latitude: 0,
      longitude: 0,
      isActive: false,
      displayOrder: 0,
      propertyRemainingShare: 0,
    },
    holiday: {
      id: 1,
      name: '',
      year: 0,
      startDate: undefined,
      endDate: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      createdBy: new User(),
      updatedBy: new User(),
      propertySeasonHolidays: [],
    },
    isPeakSeason: false,
    createdBy: {
      id: 1,
      role: new Role(),
      firstName: '',
      lastName: '',
      password: '',
      imageURL: '',
      isActive: false,
      addressLine1: '',
      addressLine2: '',
      state: '',
      country: '',
      city: '',
      zipcode: '',
      resetToken: '',
      resetTokenExpires: undefined,
      lastLoginTime: undefined,
      createdBy: 0,
      updatedBy: 0,
      createdAt: undefined,
      updatedAt: undefined,
    } as User,
  };

  describe('createPropertySeasonHoliday', () => {
    it('should create a property season holiday', async () => {
      const expectedPropertySeasonHoliday: PropertySeasonHolidays = {
        id: 1,
        property: { id: 1 } as Property,
        holiday: { id: 1 } as Holidays,
        isPeakSeason: false,
        createdBy: { id: 1 } as User,
        updatedBy: new User(),
        createdAt: new Date(),
        updatedAt: undefined,
      };
      const expectedResult =
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_CREATED(
          expectedPropertySeasonHoliday,
        );
      jest
        .spyOn(service, 'createPropertySeasonHoliday')
        .mockResolvedValue(expectedResult);

      expect(
        await controller.createPropertySeasonHoliday(
          createPropertySeasonHolidayDto,
        ),
      ).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest
        .spyOn(service, 'createPropertySeasonHoliday')
        .mockRejectedValue(error);

      try {
        await controller.createPropertySeasonHoliday(
          createPropertySeasonHolidayDto,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while creating the property season holiday',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getAllPropertySeasonHolidays', () => {
    it('should get all property season holidays', async () => {
      const expectedResult = {
        success: true,
        message: 'Property season holidays retrieved successfully',
        data: [],
        statusCode: HttpStatus.OK,
      };

      jest
        .spyOn(service, 'findAllPropertySeasonHolidays')
        .mockResolvedValue(expectedResult);

      expect(await controller.getAllPropertySeasonHolidays()).toEqual(
        expectedResult,
      );
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest
        .spyOn(service, 'findAllPropertySeasonHolidays')
        .mockRejectedValue(error);

      try {
        await controller.getAllPropertySeasonHolidays();
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving all property season holidays',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getPropertySeasonHolidayById', () => {
    it('should get property season holiday by ID', async () => {
      const mockPropertySeasonHoliday: PropertySeasonHolidays = {
        id: 1,
        property: { id: 1 } as Property,
        holiday: { id: 1 } as Holidays,
        isPeakSeason: false,
        createdBy: { id: 1 } as User,
        updatedBy: new User(),
        createdAt: new Date(),
        updatedAt: undefined,
      };

      const expectedResult =
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_FETCHED(
          mockPropertySeasonHoliday,
          mockPropertySeasonHoliday.id,
        );

      jest
        .spyOn(service, 'findPropertySeasonHolidayById')
        .mockResolvedValue(expectedResult);

      expect(
        await controller.getPropertySeasonHolidayById(
          mockPropertySeasonHoliday.id,
        ),
      ).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      const id = 1;
      jest
        .spyOn(service, 'findPropertySeasonHolidayById')
        .mockRejectedValue(error);

      try {
        await controller.getPropertySeasonHolidayById(id);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving the property season holiday',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getHolidaysByPropertyId', () => {
    it('should get all property season holidays by property Id', async () => {
      const expectedResult = {
        success: true,
        message: 'Property season holidays retrieved successfully',
        data: [],
        statusCode: HttpStatus.OK,
      };

      jest
        .spyOn(service, 'findHolidaysByPropertyId')
        .mockResolvedValue(expectedResult);

      expect(await controller.getHolidaysByPropertyId(1)).toEqual(
        expectedResult,
      );
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'findHolidaysByPropertyId').mockRejectedValue(error);

      try {
        await controller.getHolidaysByPropertyId(1);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving the holidays list for the selected property',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('updatePropertySeasonHolidayDetail', () => {
    it('should update property season holiday details', async () => {
      const updatePropertySeasonHolidayDto: UpdatePropertySeasonHolidayDto = {
        property: {
          id: 1,
          propertyName: '',
          address: '',
          city: '',
          state: '',
          country: '',
          zipcode: 0,
          houseDescription: '',
          isExclusive: false,
          propertyShare: 0,
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: undefined,
          updatedAt: undefined,
          ownerRezPropId: 0,
          latitude: 0,
          longitude: 0,
          isActive: false,
          displayOrder: 0,
          propertyRemainingShare: 0,
        },
        holiday: {
          id: 1,
          name: '',
          year: 0,
          startDate: undefined,
          endDate: undefined,
          createdAt: undefined,
          updatedAt: undefined,
          createdBy: new User(),
          updatedBy: new User(),
          propertySeasonHolidays: [],
        },
        isPeakSeason: false,
        updatedBy: {
          id: 1,
          role: new Role(),
          firstName: '',
          lastName: '',
          password: '',
          imageURL: '',
          isActive: false,
          addressLine1: '',
          addressLine2: '',
          state: '',
          country: '',
          city: '',
          zipcode: '',
          resetToken: '',
          resetTokenExpires: undefined,
          lastLoginTime: undefined,
          createdBy: 0,
          updatedBy: 0,
          createdAt: undefined,
          updatedAt: undefined,
        } as User,
      };
      const propertySeasonHoliday = { id: 1 } as PropertySeasonHolidays;
      const expectedResult =
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_UPDATED(
          propertySeasonHoliday,
          propertySeasonHoliday.id,
        );

      jest
        .spyOn(service, 'updatePropertySeasonHoliday')
        .mockResolvedValue(expectedResult);

      expect(
        await controller.updatePropertySeasonHolidayDetail(
          '1',
          updatePropertySeasonHolidayDto,
        ),
      ).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest
        .spyOn(service, 'updatePropertySeasonHoliday')
        .mockRejectedValue(error);

      try {
        await controller.updatePropertySeasonHolidayDetail(
          '1',
          {} as UpdatePropertySeasonHolidayDto,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while updating the property season holiday',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('deletePropertySeasonHoliday', () => {
    it('should delete property season holiday by id', async () => {
      const deleteResult = {
        raw: {},
        affected: 1,
      };
      const expectedResult =
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_DELETED(
          deleteResult.affected,
        );

      jest
        .spyOn(service, 'removePropertySeasonHoliday')
        .mockResolvedValue(expectedResult);

      expect(
        await controller.deletePropertySeasonHoliday(deleteResult.affected),
      ).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest
        .spyOn(service, 'removePropertySeasonHoliday')
        .mockRejectedValue(error);

      try {
        await controller.deletePropertySeasonHoliday(1);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while deleting the property season holiday',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
