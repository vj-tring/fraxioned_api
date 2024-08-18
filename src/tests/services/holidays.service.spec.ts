import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHolidayDto } from 'dto/requests/create-holiday.dto';
import { UpdateHolidayDto } from 'dto/requests/update-holiday.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HolidaysService } from 'src/main/service/holidays.service';
import { LoggerService } from 'src/main/service/logger.service';
import { Holidays } from 'src/main/entities/holidays.entity';
import { User } from 'src/main/entities/user.entity';
import { PropertySeasonHolidays } from 'src/main/entities/property-season-holidays.entity';
import { HOLIDAYS_RESPONSES } from 'src/main/commons/constants/response-constants/holiday.constants';
import { PropertyDetails } from 'src/main/entities/property-details.entity';
import { Property } from 'src/main/entities/property.entity';
import { PropertySeasonHolidaysService } from 'src/main/service/property-season-holidays.service';

describe('HolidaysService', () => {
  let service: HolidaysService;
  let holidayRepository: Repository<Holidays>;
  let usersRepository: Repository<User>;
  let propertySeasonHolidayRepository: Repository<PropertySeasonHolidays>;
  let propertyDetailsRepository: Repository<PropertyDetails>;
  let propertiesRepository: Repository<Property>;
  let propertySeasonHolidayService: PropertySeasonHolidaysService;
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
          provide: getRepositoryToken(PropertyDetails),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Property),
          useClass: Repository,
        },
        {
          provide: PropertySeasonHolidaysService,
          useValue: {
            createPropertySeasonHoliday: jest.fn(),
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

    service = module.get<HolidaysService>(HolidaysService);
    holidayRepository = module.get<Repository<Holidays>>(
      getRepositoryToken(Holidays),
    );
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    propertySeasonHolidayRepository = module.get<
      Repository<PropertySeasonHolidays>
    >(getRepositoryToken(PropertySeasonHolidays));
    propertyDetailsRepository = module.get<Repository<PropertyDetails>>(
      getRepositoryToken(PropertyDetails),
    );
    propertiesRepository = module.get<Repository<Property>>(
      getRepositoryToken(Property),
    );
    propertySeasonHolidayService = module.get<PropertySeasonHolidaysService>(
      PropertySeasonHolidaysService,
    );
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const createHolidayDto: CreateHolidayDto = {
    name: 'Test Holiday',
    year: 2023,
    startDate: new Date(),
    endDate: new Date(),
    createdBy: {
      id: 1,
    } as User,
    properties: [],
  };

  const createHolidayDtoWithProperty: CreateHolidayDto = {
    name: 'New Year',
    year: 2023,
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-01-02'),
    createdBy: {
      id: 1,
    } as User,
    properties: [
      {
        id: 1,
      } as Property,
    ],
  };

  const createHolidayDtoWithUnknownProperties: CreateHolidayDto = {
    name: 'Summer Break',
    year: 2024,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-15'),
    properties: [{ id: 1 }, { id: 999 }, { id: 45 }] as Property[],
    createdBy: { id: 1 } as User,
  };

  const propertyDetails: PropertyDetails = {
    peakSeasonStartDate: new Date('2024-03-15'),
    peakSeasonEndDate: new Date('2024-06-28'),
    id: 1,
    property: { id: 1 } as Property,
  } as PropertyDetails;

  const updateHolidayDto: UpdateHolidayDto = {
    name: 'Updated Holiday',
    year: 2023,
    startDate: new Date(),
    endDate: new Date(),
    updatedBy: {
      id: 1,
    } as User,
    properties: [
      {
        id: 1,
      } as Property,
    ],
  };

  const updateHolidayDtoWithUnknownProperties: UpdateHolidayDto = {
    updatedBy: { id: 2 } as User,
    properties: [{ id: 1 }, { id: 3 }] as Property[],
    name: '',
    year: 0,
    startDate: undefined,
    endDate: undefined,
  };

  const user = { id: 1 } as User;
  const holiday = { id: 1 } as Holidays;
  const existingProperties = [{ id: 1 }] as Property[];
  const existingHoliday = { id: 1 } as Holidays;
  const existingHolidays = [{ id: 1 }, { id: 2 }] as Holidays[];
  const existingPropertySeasonHolidays = [
    {
      id: 10,
      property: { id: 1 },
    },
    {
      id: 11,
      property: { id: 2 },
    },
  ] as PropertySeasonHolidays[];

  const commonTestData = {
    property: { id: 1 },
    holiday: { id: 1 } as Holidays,
    isPeakSeason: false,
    createdBy: { id: 1 } as User,
  };

  describe('create', () => {
    it('should create a holiday and may or may not create property holiday mapping', async () => {
      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAY_CREATED(holiday);

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertiesRepository, 'findBy')
        .mockResolvedValueOnce(existingProperties);
      jest.spyOn(holidayRepository, 'create').mockReturnValue(holiday);
      jest.spyOn(holidayRepository, 'save').mockResolvedValueOnce(holiday);
      jest
        .spyOn(propertyDetailsRepository, 'findOne')
        .mockResolvedValue(propertyDetails);
      jest
        .spyOn(propertySeasonHolidayService, 'createPropertySeasonHoliday')
        .mockResolvedValueOnce(undefined);

      expect(await service.create(createHolidayDto)).toEqual(expectedResult);
    });

    it('should return conflict if holiday already exists', async () => {
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
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = HOLIDAYS_RESPONSES.USER_NOT_FOUND(
        createHolidayDto.createdBy.id,
      );

      expect(await service.create(createHolidayDto)).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${createHolidayDto.createdBy.id} does not exist`,
      );
    });

    it('should return error if some properties do not exist', async () => {
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(usersRepository, 'findOne')
        .mockResolvedValue(createHolidayDto.createdBy);
      jest
        .spyOn(propertiesRepository, 'findBy')
        .mockResolvedValue(existingProperties);

      const result = await service.create(
        createHolidayDtoWithUnknownProperties,
      );

      expect(result).toEqual(
        HOLIDAYS_RESPONSES.PROPERTIES_NOT_FOUND([999, 45]),
      );
    });

    it('should return an error if property details are not found', async () => {
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertiesRepository, 'findBy')
        .mockResolvedValueOnce(existingProperties);
      jest.spyOn(holidayRepository, 'create').mockReturnValue(holiday);
      jest.spyOn(holidayRepository, 'save').mockResolvedValueOnce(holiday);
      jest.spyOn(propertyDetailsRepository, 'findOne').mockResolvedValue(null);

      const expectedResult = HOLIDAYS_RESPONSES.PROPERTY_DETAILS_NOT_FOUND(1);
      expect(await service.create(createHolidayDtoWithProperty)).toEqual(
        expectedResult,
      );
    });

    it('should create property holiday mapping and save records as property season holiday', async () => {
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertiesRepository, 'findBy')
        .mockResolvedValueOnce(existingProperties);
      jest.spyOn(holidayRepository, 'create').mockReturnValue(holiday);
      jest.spyOn(holidayRepository, 'save').mockResolvedValueOnce(holiday);
      jest
        .spyOn(propertyDetailsRepository, 'findOne')
        .mockResolvedValue(propertyDetails);
      jest.spyOn(service, 'isHolidayInPeakSeason').mockResolvedValueOnce(false);
      jest
        .spyOn(propertySeasonHolidayService, 'createPropertySeasonHoliday')
        .mockResolvedValue(undefined);

      const result = await service.create(createHolidayDtoWithProperty);
      expect(
        propertySeasonHolidayService.createPropertySeasonHoliday,
      ).toHaveBeenCalledWith(commonTestData);

      expect(result).toEqual(HOLIDAYS_RESPONSES.HOLIDAY_CREATED(result.data));
    });

    it('should handle errors during creation', async () => {
      jest
        .spyOn(holidayRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.create(createHolidayDto)).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('to check if the given date range of an holidays is peak season or not', () => {
    it('should return true if both holiday dates are within peak season', async () => {
      const startHolidayDate = new Date('2024-06-15');
      const endHolidayDate = new Date('2024-06-18');

      const result = await service.isHolidayInPeakSeason(
        startHolidayDate,
        endHolidayDate,
        propertyDetails,
      );
      expect(result).toBe(true);
    });

    it('should return false if both holiday dates are outside the peak season', async () => {
      const startHolidayDate = new Date('2024-12-20');
      const endHolidayDate = new Date('2024-12-25');

      const result = await service.isHolidayInPeakSeason(
        startHolidayDate,
        endHolidayDate,
        propertyDetails,
      );
      expect(result).toBe(false);
    });

    it('should return false if one holiday date is within the peak season and the other is outside', async () => {
      const startHolidayDate = new Date('2024-06-15');
      const endHolidayDate = new Date('2024-07-05');

      const result = await service.isHolidayInPeakSeason(
        startHolidayDate,
        endHolidayDate,
        propertyDetails,
      );
      expect(result).toBe(false);
    });

    it('should return false if the holiday start and end dates are the same and not in peak season', async () => {
      const startHolidayDate = new Date('2024-12-25');
      const endHolidayDate = new Date('2024-12-25');

      const result = await service.isHolidayInPeakSeason(
        startHolidayDate,
        endHolidayDate,
        propertyDetails,
      );
      expect(result).toBe(false);
    });

    it('should return true if the peak season dates are the same as the holiday dates', async () => {
      const startHolidayDate = new Date('2024-06-01');
      const endHolidayDate = new Date('2024-06-01');
      const propertyDetails = {
        peakSeasonStartDate: new Date('2024-06-01'),
        peakSeasonEndDate: new Date('2024-06-01'),
      } as PropertyDetails;

      const result = await service.isHolidayInPeakSeason(
        startHolidayDate,
        endHolidayDate,
        propertyDetails,
      );
      expect(result).toBe(true);
    });

    it('should throw an HttpException if an internal error occurs', async () => {
      const startHolidayDate = new Date('2024-06-15');
      const endHolidayDate = new Date('2024-06-18');

      await expect(
        service.isHolidayInPeakSeason(startHolidayDate, endHolidayDate, null),
      ).rejects.toThrow(HttpException);

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getAllHolidayRecords', () => {
    it('should get all holiday records', async () => {
      const expectedResult =
        HOLIDAYS_RESPONSES.HOLIDAYS_FETCHED(existingHolidays);

      jest.spyOn(holidayRepository, 'find').mockResolvedValue(existingHolidays);

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
      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAY_FETCHED(holiday);

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValue(holiday);

      expect(await service.findHolidayById(holiday.id)).toEqual(expectedResult);
    });

    it('should return no holiday exists for the given id', async () => {
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAY_NOT_FOUND(holiday.id);

      expect(await service.findHolidayById(holiday.id)).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Holiday with ID ${holiday.id} not found`,
      );
    });

    it('should handle errors during retrieval of a holiday', async () => {
      jest
        .spyOn(holidayRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.findHolidayById(holiday.id)).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updating holiday details and there may be creation, deletion or no creation of property season holiday', () => {
    it('should update holiday details', async () => {
      const updatedHoliday = holiday;

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(holiday);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertiesRepository, 'findBy')
        .mockResolvedValueOnce(existingProperties);
      jest
        .spyOn(holidayRepository, 'save')
        .mockResolvedValueOnce(updatedHoliday);

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce({
        ...updatedHoliday,
        propertySeasonHolidays: [],
      } as Holidays);

      jest
        .spyOn(propertySeasonHolidayRepository, 'delete')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(propertyDetailsRepository, 'findOne')
        .mockResolvedValueOnce(propertyDetails);
      const result = await service.updateHolidayDetail(
        updatedHoliday.id,
        updateHolidayDto,
      );

      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAY_UPDATED(updatedHoliday);
      expect(result).toEqual(expectedResult);
    });

    it('should return not found if holiday does not exist', async () => {
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(null);
      const expectedResult = HOLIDAYS_RESPONSES.HOLIDAY_NOT_FOUND(holiday.id);

      expect(
        await service.updateHolidayDetail(holiday.id, updateHolidayDto),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Holiday with ID ${holiday.id} not found`,
      );
    });

    it('should return not found if user does not exist', async () => {
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(holiday);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = HOLIDAYS_RESPONSES.USER_NOT_FOUND(
        updateHolidayDto.updatedBy.id,
      );

      expect(
        await service.updateHolidayDetail(holiday.id, updateHolidayDto),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${updateHolidayDto.updatedBy.id} does not exist`,
      );
    });

    it('should return an error if some properties do not exist', async () => {
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(holiday);
      jest
        .spyOn(usersRepository, 'findOne')
        .mockResolvedValueOnce(updateHolidayDtoWithUnknownProperties.updatedBy);
      jest
        .spyOn(propertiesRepository, 'findBy')
        .mockResolvedValueOnce([{ id: 1 }] as Property[]);

      const result = await service.updateHolidayDetail(
        holiday.id,
        updateHolidayDtoWithUnknownProperties,
      );

      expect(result).toEqual(HOLIDAYS_RESPONSES.PROPERTIES_NOT_FOUND([3]));
    });

    it('should return not found if holiday does not exist during the property season holiday check', async () => {
      const updatedHoliday = holiday;

      jest
        .spyOn(holidayRepository, 'findOne')
        .mockResolvedValueOnce(holiday)
        .mockResolvedValueOnce(null);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertiesRepository, 'findBy')
        .mockResolvedValueOnce(existingProperties);
      jest
        .spyOn(holidayRepository, 'save')
        .mockResolvedValueOnce(updatedHoliday);

      const result = await service.updateHolidayDetail(
        updatedHoliday.id,
        updateHolidayDto,
      );

      expect(result).toEqual(
        HOLIDAYS_RESPONSES.HOLIDAY_NOT_FOUND(updatedHoliday.id),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Holiday with ID ${updatedHoliday.id} not found`,
      );
    });

    it('should delete existing property season holidays if they are not in the updated properties', async () => {
      const id = 1;
      const existingProperties = [{ id: 1 }, { id: 2 }] as Property[];
      const updatedHoliday = holiday;

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(holiday);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertiesRepository, 'findBy')
        .mockResolvedValueOnce(existingProperties);
      jest
        .spyOn(holidayRepository, 'save')
        .mockResolvedValueOnce(updatedHoliday);

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce({
        ...updatedHoliday,
        propertySeasonHolidays: existingPropertySeasonHolidays,
      } as Holidays);

      const deleteSpy = jest
        .spyOn(propertySeasonHolidayRepository, 'delete')
        .mockResolvedValueOnce(null);

      const result = await service.updateHolidayDetail(id, updateHolidayDto);

      expect(deleteSpy).toHaveBeenCalledWith([11]);
      expect(result).toEqual(
        HOLIDAYS_RESPONSES.HOLIDAY_UPDATED(updatedHoliday),
      );
    });

    it('should return an error if property details are not found when creating PropertySeasonHoliday', async () => {
      const updatedHoliday = holiday;

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(holiday);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertiesRepository, 'findBy')
        .mockResolvedValueOnce(existingProperties);
      jest
        .spyOn(holidayRepository, 'save')
        .mockResolvedValueOnce(updatedHoliday);

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce({
        ...updatedHoliday,
        propertySeasonHolidays: [],
      } as Holidays);

      jest
        .spyOn(propertySeasonHolidayRepository, 'delete')
        .mockResolvedValueOnce(null);

      jest
        .spyOn(propertyDetailsRepository, 'findOne')
        .mockResolvedValueOnce(null);

      const result = await service.updateHolidayDetail(
        holiday.id,
        updateHolidayDto,
      );
      const expectedResult = HOLIDAYS_RESPONSES.PROPERTY_DETAILS_NOT_FOUND(1);
      expect(result).toEqual(expectedResult);
    });

    it('should use updateHolidayDto dates if provided', async () => {
      const id = 1;
      const holiday = {
        id,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-05-10'),
      } as Holidays;

      const updatedHoliday = holiday;

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(holiday);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertiesRepository, 'findBy')
        .mockResolvedValueOnce(existingProperties);
      jest
        .spyOn(holidayRepository, 'save')
        .mockResolvedValueOnce(updatedHoliday);
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce({
        ...updatedHoliday,
        propertySeasonHolidays: [],
      } as Holidays);

      jest
        .spyOn(propertySeasonHolidayRepository, 'delete')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(propertyDetailsRepository, 'findOne')
        .mockResolvedValueOnce({ id: 1 } as PropertyDetails);

      const createPropertySeasonHolidaySpy = jest.spyOn(
        propertySeasonHolidayService,
        'createPropertySeasonHoliday',
      );

      await service.updateHolidayDetail(id, updateHolidayDto);

      expect(createPropertySeasonHolidaySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isPeakSeason: expect.any(Boolean),
          property: expect.any(Object),
          holiday: { id } as Holidays,
          createdBy: user,
        }),
      );
    });

    it('should use existing holiday dates if updateHolidayDto dates are not provided', async () => {
      const id = 1;
      const holiday = {
        id,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-05-10'),
      } as Holidays;

      const updatedHoliday = holiday;

      const updateHolidayDto: UpdateHolidayDto = {
        updatedBy: user,
        properties: [{ id: 1 }] as Property[],
        name: '',
        year: 0,
        startDate: undefined,
        endDate: undefined,
      };

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(holiday);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertiesRepository, 'findBy')
        .mockResolvedValueOnce(existingProperties);
      jest
        .spyOn(holidayRepository, 'save')
        .mockResolvedValueOnce(updatedHoliday);
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce({
        ...updatedHoliday,
        propertySeasonHolidays: [],
      } as Holidays);

      jest
        .spyOn(propertySeasonHolidayRepository, 'delete')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(propertyDetailsRepository, 'findOne')
        .mockResolvedValueOnce({ id: 1 } as PropertyDetails);

      const createPropertySeasonHolidaySpy = jest.spyOn(
        propertySeasonHolidayService,
        'createPropertySeasonHoliday',
      );

      await service.updateHolidayDetail(id, updateHolidayDto);

      expect(createPropertySeasonHolidaySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isPeakSeason: expect.any(Boolean),
          property: expect.any(Object),
          holiday: { id } as Holidays,
          createdBy: user,
        }),
      );
    });

    it('should throw an HttpException if a database error occurs', async () => {
      const id = 1;
      jest
        .spyOn(holidayRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        service.updateHolidayDetail(id, updateHolidayDto),
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
