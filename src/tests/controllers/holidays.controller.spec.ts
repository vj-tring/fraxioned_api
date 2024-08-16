import { Test, TestingModule } from '@nestjs/testing';
import { CreateHolidayDto } from 'dto/requests/create-holiday.dto';
import { UpdateHolidayDto } from 'dto/requests/update-holiday.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Holidays } from 'src/main/entities/holidays.entity';
import { HolidaysController } from 'src/main/controller/holidays.controller';
import { HolidaysService } from 'src/main/service/holidays.service';
import { LoggerService } from 'src/main/service/logger.service';
import { User } from 'src/main/entities/user.entity';
import { HOLIDAYS_RESPONSES } from 'src/main/commons/constants/response-constants/holiday.constants';
import { Role } from 'src/main/entities/role.entity';
import { AuthenticationService } from 'src/main/service/authentication.service';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';

describe('HolidaysController', () => {
  let controller: HolidaysController;
  let service: HolidaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HolidaysController],
      providers: [
        {
          provide: HolidaysService,
          useValue: {
            create: jest.fn(),
            getAllHolidayRecords: jest.fn(),
            findHolidayById: jest.fn(),
            updateHolidayDetail: jest.fn(),
            deleteHolidayById: jest.fn(),
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
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<HolidaysController>(HolidaysController);
    service = module.get<HolidaysService>(HolidaysService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createHoliday', () => {
    it('should create a holiday', async () => {
      const createHolidayDto: CreateHolidayDto = {
        name: 'Test Holiday',
        year: 2023,
        startDate: new Date(),
        endDate: new Date(),
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
        properties: [],
      };

      const expectedHoliday: Holidays = {
        id: 1,
        name: 'Test Holiday',
        year: 2023,
        startDate: new Date(),
        endDate: new Date(),
        createdBy: { id: 1 } as User,
        updatedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        propertySeasonHolidays: [],
      };
      const expectedResult =
        HOLIDAYS_RESPONSES.HOLIDAY_CREATED(expectedHoliday);
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      expect(await controller.createHoliday(createHolidayDto)).toEqual(
        expectedResult,
      );
    });

    it('should throw an HttpException if an error occurs', async () => {
      const createHolidayDto: CreateHolidayDto = {
        name: 'Test Holiday',
        year: 2023,
        startDate: new Date(),
        endDate: new Date(),
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
        properties: [],
      };
      const error = new Error('An error occurred');
      jest.spyOn(service, 'create').mockRejectedValue(error);

      try {
        await controller.createHoliday(createHolidayDto);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while creating the holiday',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getAllHolidays', () => {
    it('should get all holidays', async () => {
      const expectedResult = {
        success: true,
        message: 'Holidays retrieved successfully',
        data: [],
        statusCode: HttpStatus.OK,
      };

      jest
        .spyOn(service, 'getAllHolidayRecords')
        .mockResolvedValue(expectedResult);

      expect(await controller.getAllHolidays()).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'getAllHolidayRecords').mockRejectedValue(error);

      try {
        await controller.getAllHolidays();
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving all holidays',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getHolidayById', () => {
    it('should get holiday by ID', async () => {
      const mockHoliday: Holidays = {
        id: 1,
        name: 'Test Holiday',
        year: 2023,
        startDate: new Date(),
        endDate: new Date(),
        createdBy: new User(),
        updatedBy: new User(),
        createdAt: new Date(),
        updatedAt: new Date(),
        propertySeasonHolidays: [],
      };

      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAY_FETCHED(mockHoliday);

      const id = 1;
      jest.spyOn(service, 'findHolidayById').mockResolvedValue(expectedResult);

      expect(await controller.getHolidayById(id)).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      const id = 1;
      jest.spyOn(service, 'findHolidayById').mockRejectedValue(error);

      try {
        await controller.getHolidayById(id);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving the holiday',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('updateHolidayDetail', () => {
    it('should update holiday details', async () => {
      const updateHolidayDto: UpdateHolidayDto = {
        name: 'Updated Holiday',
        year: 2023,
        startDate: new Date(),
        endDate: new Date(),
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
        properties: [],
      };
      const holiday = { id: 1 } as Holidays;
      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAY_UPDATED(holiday);

      jest
        .spyOn(service, 'updateHolidayDetail')
        .mockResolvedValue(expectedResult);

      expect(
        await controller.updateHolidayDetail('1', updateHolidayDto),
      ).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'updateHolidayDetail').mockRejectedValue(error);

      try {
        await controller.updateHolidayDetail('1', {} as UpdateHolidayDto);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while updating the holiday',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('deleteHoliday', () => {
    it('should delete holiday by id', async () => {
      const deleteResult = {
        raw: {},
        affected: 1,
      };
      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAY_DELETED(
        deleteResult.affected,
      );

      jest
        .spyOn(service, 'deleteHolidayById')
        .mockResolvedValue(expectedResult);

      expect(await controller.deleteHoliday(1)).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'deleteHolidayById').mockRejectedValue(error);

      try {
        await controller.deleteHoliday(1);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while deleting the holiday',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
