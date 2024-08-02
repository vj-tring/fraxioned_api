import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHolidayDto } from 'dto/create-holiday.dto';
import { UpdateHolidayDto } from 'dto/update-holiday.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HolidaysService } from 'src/main/service/holidays.service';
import { LoggerService } from 'src/main/service/logger.service';
import { Holidays } from 'src/main/entities/holidays.entity';
import { User } from 'src/main/entities/user.entity';
import { PropertySeasonHolidays } from 'src/main/entities/property-season-holidays.entity';
import { HOLIDAYS_RESPONSES } from 'src/main/commons/constants/holidays-response.constants';

describe('HolidaysService', () => {
  let service: HolidaysService;
  let holidayRepository: Repository<Holidays>;
  let usersRepository: Repository<User>;
  let propertySeasonHolidayRepository: Repository<PropertySeasonHolidays>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HolidaysService,
        {
          provide: getRepositoryToken(Holidays),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PropertySeasonHolidays),
          useClass: Repository,
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

    service = module.get<HolidaysService>(HolidaysService);
    holidayRepository = module.get<Repository<Holidays>>(
      getRepositoryToken(Holidays),
    );
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    propertySeasonHolidayRepository = module.get<
      Repository<PropertySeasonHolidays>
    >(getRepositoryToken(PropertySeasonHolidays));
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a holiday', async () => {
      const createHolidayDto: CreateHolidayDto = {
        name: 'Test Holiday',
        year: 2023,
        startDate: new Date(),
        endDate: new Date(),
        createdBy: 1,
      };
      const user = { id: 1 } as User;
      const holiday = { id: 1 } as Holidays;
      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAY_CREATED(holiday);
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(holidayRepository, 'create').mockReturnValue(holiday);
      jest.spyOn(holidayRepository, 'save').mockResolvedValueOnce(holiday);

      expect(await service.create(createHolidayDto)).toEqual(expectedResult);
    });

    it('should return conflict if holiday already exists', async () => {
      const createHolidayDto: CreateHolidayDto = {
        name: 'Test Holiday',
        year: 2023,
        startDate: new Date(),
        endDate: new Date(),
        createdBy: 1,
      };
      const existingHoliday = { id: 1 } as Holidays;

      jest
        .spyOn(holidayRepository, 'findOne')
        .mockResolvedValueOnce(existingHoliday);

      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAY_ALREADY_EXISTS(
        createHolidayDto.name,
        createHolidayDto.year,
      );
      expect(await service.create(createHolidayDto)).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Error creating holiday: Holiday ${createHolidayDto.name} for the year ${createHolidayDto.year} already exists`,
      );
    });

    it('should return not found if user does not exist', async () => {
      const createHolidayDto: CreateHolidayDto = {
        name: 'Test Holiday',
        year: 2023,
        startDate: new Date(),
        endDate: new Date(),
        createdBy: 1,
      };
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = HOLIDAYS_RESPONSES.USER_NOT_FOUND(
        createHolidayDto.createdBy,
      );

      expect(await service.create(createHolidayDto)).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${createHolidayDto.createdBy} does not exist`,
      );
    });

    it('should handle errors during creation', async () => {
      const createHolidayDto: CreateHolidayDto = {
        name: 'Test Holiday',
        year: 2023,
        startDate: new Date(),
        endDate: new Date(),
        createdBy: 1,
      };

      jest
        .spyOn(holidayRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.create(createHolidayDto)).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getAllHolidayRecords', () => {
    it('should get all holiday records', async () => {
      const holidays: Holidays[] = [
        {
          id: 1,
          name: 'Holiday 1',
          year: 2024,
          startDate: new Date('2024-12-25'),
          endDate: new Date('2024-12-26'),
          createdAt: undefined,
          updatedAt: undefined,
          createdBy: new User(),
          updatedBy: new User(),
        },
        {
          id: 2,
          name: 'Holiday 2',
          year: 2024,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-01'),
          createdAt: undefined,
          updatedAt: undefined,
          createdBy: new User(),
          updatedBy: new User(),
        },
      ];
      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAYS_FETCHED(holidays);

      jest.spyOn(holidayRepository, 'find').mockResolvedValue(holidays);

      expect(await service.getAllHolidayRecords()).toEqual(expectedResult);
    });

    it('should return no holidays if no holidays found', async () => {
      const holidays: Holidays[] = [];
      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAYS_NOT_FOUND();

      jest.spyOn(holidayRepository, 'find').mockResolvedValue(holidays);

      expect(await service.getAllHolidayRecords()).toEqual(expectedResult);
    });

    it('should handle errors during retrieval of all holidays', async () => {
      jest
        .spyOn(holidayRepository, 'find')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.getAllHolidayRecords()).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findHolidayById', () => {
    it('should find holiday by Id', async () => {
      const holiday = { id: 1 } as Holidays;
      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAY_FETCHED(holiday);

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValue(holiday);
      const id = 1;
      expect(await service.findHolidayById(id)).toEqual(expectedResult);
    });

    it('should return no holiday exists for the given id', async () => {
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(null);
      const id = 1;
      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAY_NOT_FOUND(id);

      expect(await service.findHolidayById(id)).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Holiday with ID ${id} not found`,
      );
    });

    it('should handle errors during retrieval of a holiday', async () => {
      jest
        .spyOn(holidayRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));
      const id = 1;
      await expect(service.findHolidayById(id)).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateHolidayDetail', () => {
    it('should update holiday details', async () => {
      const updateHolidayDto: UpdateHolidayDto = {
        name: 'Updated Holiday',
        year: 2023,
        startDate: new Date(),
        endDate: new Date(),
        updatedBy: 1,
      };
      const holiday = { id: 1 } as Holidays;
      const user = { id: 1 } as User;
      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAY_UPDATED(holiday);

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(holiday);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(holidayRepository, 'save').mockResolvedValueOnce(holiday);

      expect(await service.updateHolidayDetail(1, updateHolidayDto)).toEqual(
        expectedResult,
      );
    });

    it('should return not found if holiday does not exist', async () => {
      const updateHolidayDto: UpdateHolidayDto = {
        name: 'Test Holiday',
        year: 2023,
        startDate: new Date(),
        endDate: new Date(),
        updatedBy: 1,
      };
      const id = 1;
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAY_NOT_FOUND(id);

      expect(await service.updateHolidayDetail(1, updateHolidayDto)).toEqual(
        expectedResult,
      );
      expect(logger.error).toHaveBeenCalledWith(`Holiday with ID 1 not found`);
    });

    it('should return not found if user does not exist', async () => {
      const updateHolidayDto: UpdateHolidayDto = {
        name: 'Test Holiday',
        year: 2023,
        startDate: new Date(),
        endDate: new Date(),
        updatedBy: 1,
      };

      const holiday = { id: 1 } as Holidays;

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(holiday);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = HOLIDAYS_RESPONSES.USER_NOT_FOUND(
        updateHolidayDto.updatedBy,
      );

      expect(await service.updateHolidayDetail(1, updateHolidayDto)).toEqual(
        expectedResult,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${updateHolidayDto.updatedBy} does not exist`,
      );
    });
    it('should handle errors during update of a holiday', async () => {
      const updateHolidayDto: UpdateHolidayDto = {
        name: 'Updated Holiday',
        year: 2023,
        startDate: new Date(),
        endDate: new Date(),
        updatedBy: 1,
      };
      jest
        .spyOn(holidayRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        service.updateHolidayDetail(1, updateHolidayDto),
      ).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteHolidayById', () => {
    it('should log a message and return foreign key conflict response if holiday is mapped to a property', async () => {
      const holidayId = 1;
      const mockPropertySeasonHoliday = new PropertySeasonHolidays();
      mockPropertySeasonHoliday.id = holidayId;

      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockResolvedValue(mockPropertySeasonHoliday);
      const loggerSpy = jest.spyOn(logger, 'log');
      const expectedResponse =
        HOLIDAYS_RESPONSES.HOLIDAY_FOREIGN_KEY_CONFLICT(holidayId);

      const result = await service.deleteHolidayById(holidayId);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Holiday ID ${holidayId} exists and is mapped to property, hence cannot be deleted.`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should log a message and return not found response if holiday is not found', async () => {
      const holidayId = 1;

      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockResolvedValue(null);
      jest
        .spyOn(holidayRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 0 });
      const loggerErrorSpy = jest.spyOn(logger, 'error');
      const expectedResponse = HOLIDAYS_RESPONSES.HOLIDAY_NOT_FOUND(holidayId);

      const result = await service.deleteHolidayById(holidayId);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Holiday with ID ${holidayId} not found`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should log a message and return success response if holiday is deleted successfully', async () => {
      const holidayId = 1;

      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockResolvedValue(null);
      jest
        .spyOn(holidayRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 1 });
      const loggerLogSpy = jest.spyOn(logger, 'log');
      const expectedResponse = HOLIDAYS_RESPONSES.HOLIDAY_DELETED(holidayId);

      const result = await service.deleteHolidayById(holidayId);

      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Holiday with ID ${holidayId} deleted successfully`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw an HttpException if an error occurs during deletion', async () => {
      const holidayId = 1;
      const error = new Error('An error occurred');

      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockRejectedValue(error);
      const loggerErrorSpy = jest.spyOn(logger, 'error');

      try {
        await service.deleteHolidayById(holidayId);
      } catch (err) {
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          `Error deleting holiday with ID ${holidayId}: ${error.message} - ${error.stack}`,
        );
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while deleting the holiday',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
