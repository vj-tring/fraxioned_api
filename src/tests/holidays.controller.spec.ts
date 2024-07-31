import { Test, TestingModule } from '@nestjs/testing';
import { CreateHolidayDto } from 'dto/create-holiday.dto';
import { UpdateHolidayDto } from 'dto/update-holiday.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Role } from 'src/main/entities/role.entity';
import { Holidays } from 'src/main/entities/holidays.entity';
import { HolidaysController } from 'src/main/controller/holidays.controller';
import { HolidaysService } from 'src/main/service/holidays.service';
import { LoggerService } from 'src/main/service/logger.service';
import { User } from 'src/main/entities/user.entity';

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
            findHolidayByDateRange: jest.fn(),
            updateHolidayDetail: jest.fn(),
            deleteAllHolidays: jest.fn(),
            deleteHolidayById: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
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
        },
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
      };

      const expectedResult = {
        success: true,
        message: 'Holiday created successfully',
        data: expectedHoliday,
        statusCode: HttpStatus.CREATED,
      };

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
        },
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

  describe('getHolidayByDate', () => {
    it('should get holiday by date range', async () => {
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
      };

      const expectedResult = {
        success: true,
        message: 'Holiday retrieved successfully',
        data: mockHoliday,
        statusCode: HttpStatus.OK,
      };

      jest
        .spyOn(service, 'findHolidayByDateRange')
        .mockResolvedValue(expectedResult);

      expect(await controller.getHolidayByDate(new Date(), new Date())).toEqual(
        expectedResult,
      );
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'findHolidayByDateRange').mockRejectedValue(error);

      try {
        await controller.getHolidayByDate(new Date(), new Date());
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
        },
      };
      const expectedResult = {
        success: true,
        message: 'Holiday updated successfully',
        statusCode: HttpStatus.OK,
      };

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

  describe('deleteAllHolidays', () => {
    it('should delete all holidays', async () => {
      const expectedResult = {
        success: true,
        message: 'Deleted all holidays successfully',
        statusCode: HttpStatus.OK,
      };

      jest
        .spyOn(service, 'deleteAllHolidays')
        .mockResolvedValue(expectedResult);

      expect(await controller.deleteAllHolidays()).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'deleteAllHolidays').mockRejectedValue(error);

      try {
        await controller.deleteAllHolidays();
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while deleting all holidays',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('deleteHoliday', () => {
    it('should delete holiday by id', async () => {
      const expectedResult = {
        success: true,
        message: 'Holiday deleted successfully',
        statusCode: HttpStatus.NO_CONTENT,
      };

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
