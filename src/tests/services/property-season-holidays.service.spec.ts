import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';
import { LoggerService } from 'src/main/service/logger.service';
import { Holidays } from 'src/main/entities/holidays.entity';
import { User } from 'src/main/entities/user.entity';
import { PropertySeasonHolidays } from 'src/main/entities/property-season-holidays.entity';
import { HOLIDAYS_RESPONSES } from 'src/main/commons/constants/response-constants/holidays-response.constants';
import { Role } from 'src/main/entities/role.entity';
import { PropertySeasonHolidaysService } from 'src/main/service/property-season-holidays.service';
import { Properties } from 'src/main/entities/properties.entity';
import { CreatePropertySeasonHolidayDto } from 'src/main/dto/requests/create-property-season-holiday.dto';
import { PROPERTY_SEASON_HOLIDAY_RESPONSES } from 'src/main/commons/constants/response-constants/property-season-holidays-response.constants';
import { UpdatePropertySeasonHolidayDto } from 'src/main/dto/requests/update-property-season-holiday.dto';

describe('PropertySeasonHolidaysService', () => {
  let service: PropertySeasonHolidaysService;
  let propertySeasonHolidayRepository: Repository<PropertySeasonHolidays>;
  let usersRepository: Repository<User>;
  let holidayRepository: Repository<Holidays>;
  let propertiesRepository: Repository<Properties>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertySeasonHolidaysService,
        {
          provide: getRepositoryToken(PropertySeasonHolidays),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Holidays),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Properties),
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

    service = module.get<PropertySeasonHolidaysService>(
      PropertySeasonHolidaysService,
    );
    propertySeasonHolidayRepository = module.get<
      Repository<PropertySeasonHolidays>
    >(getRepositoryToken(PropertySeasonHolidays));
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    holidayRepository = module.get<Repository<Holidays>>(
      getRepositoryToken(Holidays),
    );
    propertiesRepository = module.get<Repository<Properties>>(
      getRepositoryToken(Properties),
    );
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      mapCoordinates: '',
      createdBy: new User(),
      updatedBy: new User(),
      createdAt: undefined,
      updatedAt: undefined,
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
    },
  };

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
      mapCoordinates: '',
      createdBy: new User(),
      updatedBy: new User(),
      createdAt: undefined,
      updatedAt: undefined,
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
    },
  };

  describe('createPropertySeasonHoliday', () => {
    it('should create a property season holiday', async () => {
      const property = { id: 1 } as Properties;
      const user = { id: 1 } as User;
      const holiday = { id: 1 } as Holidays;
      const propertySeasonHoliday = { id: 1 } as PropertySeasonHolidays;
      const expectedResult =
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_CREATED(
          propertySeasonHoliday,
        );

      jest
        .spyOn(propertiesRepository, 'findOne')
        .mockResolvedValueOnce(property);
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(holiday);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockResolvedValue(null);
      jest
        .spyOn(propertySeasonHolidayRepository, 'create')
        .mockReturnValue(propertySeasonHoliday);
      jest
        .spyOn(propertySeasonHolidayRepository, 'save')
        .mockResolvedValueOnce(propertySeasonHoliday);

      expect(
        await service.createPropertySeasonHoliday(
          createPropertySeasonHolidayDto,
        ),
      ).toEqual(expectedResult);
    });

    it('should return property not found if property does not exist', async () => {
      jest.spyOn(propertiesRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult =
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_NOT_FOUND(
          createPropertySeasonHolidayDto.property.id,
        );

      expect(
        await service.createPropertySeasonHoliday(
          createPropertySeasonHolidayDto,
        ),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Property with ID ${createPropertySeasonHolidayDto.property.id} does not exist`,
      );
    });

    it('should return holiday not found if holiday does not exist', async () => {
      jest
        .spyOn(propertiesRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as Properties);
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult =
        PROPERTY_SEASON_HOLIDAY_RESPONSES.HOLIDAY_NOT_FOUND(
          createPropertySeasonHolidayDto.holiday.id,
        );

      expect(
        await service.createPropertySeasonHoliday(
          createPropertySeasonHolidayDto,
        ),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Holiday with ID ${createPropertySeasonHolidayDto.holiday.id} does not exist`,
      );
    });

    it('should return not found if user does not exist', async () => {
      jest
        .spyOn(propertiesRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as Properties);
      jest
        .spyOn(holidayRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as Holidays);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      const expectedResult = PROPERTY_SEASON_HOLIDAY_RESPONSES.USER_NOT_FOUND(
        createPropertySeasonHolidayDto.createdBy.id,
      );

      expect(
        await service.createPropertySeasonHoliday(
          createPropertySeasonHolidayDto,
        ),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${createPropertySeasonHolidayDto.createdBy.id} does not exist`,
      );
    });

    it('should return PROPERTY_SEASON_HOLIDAY_ALREADY_EXISTS if the mapping already exists', async () => {
      jest
        .spyOn(propertiesRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as Properties);
      jest
        .spyOn(holidayRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as Holidays);
      jest
        .spyOn(usersRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as User);
      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockResolvedValue({} as PropertySeasonHolidays);

      expect(
        await service.createPropertySeasonHoliday(
          createPropertySeasonHolidayDto,
        ),
      ).toEqual(
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_ALREADY_EXISTS(
          createPropertySeasonHolidayDto.property.id,
          createPropertySeasonHolidayDto.holiday.id,
        ),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Error creating property Season Holiday: Property ID ${createPropertySeasonHolidayDto.property.id} with Holiday ID ${createPropertySeasonHolidayDto.holiday.id} already exists`,
      );
    });

    it('should handle errors during creation', async () => {
      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        service.createPropertySeasonHoliday(createPropertySeasonHolidayDto),
      ).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findAllPropertySeasonHolidays', () => {
    it('should get all propety season holiday records', async () => {
      const propertySeasonHolidays: PropertySeasonHolidays[] = [
        {
          id: 1,
          property: new Properties(),
          holiday: new Holidays(),
          isPeakSeason: false,
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: undefined,
          updatedAt: undefined,
        },
        {
          id: 2,
          property: new Properties(),
          holiday: new Holidays(),
          isPeakSeason: false,
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: undefined,
          updatedAt: undefined,
        },
      ];
      const expectedResult =
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAYS_FETCHED(
          propertySeasonHolidays,
        );

      jest
        .spyOn(propertySeasonHolidayRepository, 'find')
        .mockResolvedValue(propertySeasonHolidays);

      expect(await service.findAllPropertySeasonHolidays()).toEqual(
        expectedResult,
      );
    });

    it('should return no property season holidays if no property season holidays found', async () => {
      const propertySeasonHolidays: PropertySeasonHolidays[] = [];
      const expectedResult =
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAYS_NOT_FOUND();

      jest
        .spyOn(propertySeasonHolidayRepository, 'find')
        .mockResolvedValue(propertySeasonHolidays);

      expect(await service.findAllPropertySeasonHolidays()).toEqual(
        expectedResult,
      );
    });

    it('should handle errors during retrieval of all property season holidays', async () => {
      jest
        .spyOn(propertySeasonHolidayRepository, 'find')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.findAllPropertySeasonHolidays()).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findPropertySeasonHolidayById', () => {
    it('should find property season holiday by Id', async () => {
      const propertySeasonHoliday = { id: 1 } as PropertySeasonHolidays;
      const expectedResult =
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_FETCHED(
          propertySeasonHoliday,
          propertySeasonHoliday.id,
        );

      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockResolvedValue(propertySeasonHoliday);
      expect(
        await service.findPropertySeasonHolidayById(propertySeasonHoliday.id),
      ).toEqual(expectedResult);
    });

    it('should return no property season holiday exists for the given id', async () => {
      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockResolvedValueOnce(null);
      const id = 1;
      const expectedResult =
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_NOT_FOUND(id);

      expect(await service.findPropertySeasonHolidayById(id)).toEqual(
        expectedResult,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Property Season Holiday with ID ${id} not found`,
      );
    });

    it('should handle errors during retrieval of a property season holiday', async () => {
      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));
      const id = 1;
      await expect(service.findPropertySeasonHolidayById(id)).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updatePropertySeasonHoliday', () => {
    it('should update property season holiday details', async () => {
      const propertySeasonHoliday = { id: 1 } as PropertySeasonHolidays;
      const user = { id: 1 } as User;
      const property = { id: 1 } as Properties;
      const holiday = { id: 1 } as Holidays;
      const expectedResult =
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_UPDATED(
          propertySeasonHoliday,
          propertySeasonHoliday.id,
        );

      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockResolvedValue(propertySeasonHoliday);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(propertiesRepository, 'findOne').mockResolvedValue(property);
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValue(holiday);
      jest
        .spyOn(propertySeasonHolidayRepository, 'save')
        .mockResolvedValue(propertySeasonHoliday);

      expect(
        await service.updatePropertySeasonHoliday(
          propertySeasonHoliday.id,
          updatePropertySeasonHolidayDto,
        ),
      ).toEqual(expectedResult);
    });

    it('should return PROPERTY_SEASON_HOLIDAY_NOT_FOUND if the property season holiday does not exist', async () => {
      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockResolvedValue(null);

      const result = await service.updatePropertySeasonHoliday(
        1,
        updatePropertySeasonHolidayDto,
      );

      expect(result).toEqual(
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_NOT_FOUND(1),
      );
    });

    it('should return user not found if user does not exist', async () => {
      const propertySeasonHoliday = { id: 1 } as PropertySeasonHolidays;

      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockResolvedValueOnce(propertySeasonHoliday);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = HOLIDAYS_RESPONSES.USER_NOT_FOUND(
        updatePropertySeasonHolidayDto.updatedBy.id,
      );

      expect(
        await service.updatePropertySeasonHoliday(
          1,
          updatePropertySeasonHolidayDto,
        ),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${updatePropertySeasonHolidayDto.updatedBy.id} does not exist`,
      );
    });

    it('should return PROPERTY_NOT_FOUND if the property does not exist', async () => {
      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as PropertySeasonHolidays);
      jest
        .spyOn(usersRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as User);
      jest.spyOn(propertiesRepository, 'findOne').mockResolvedValue(null);

      const result = await service.updatePropertySeasonHoliday(
        1,
        updatePropertySeasonHolidayDto,
      );

      expect(result).toEqual(
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_NOT_FOUND(
          updatePropertySeasonHolidayDto.property.id,
        ),
      );
    });

    it('should return HOLIDAY_NOT_FOUND if the holiday does not exist', async () => {
      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as PropertySeasonHolidays);
      jest
        .spyOn(usersRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as User);
      jest
        .spyOn(propertiesRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as Properties);
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValue(null);

      const result = await service.updatePropertySeasonHoliday(
        1,
        updatePropertySeasonHolidayDto,
      );

      expect(result).toEqual(
        PROPERTY_SEASON_HOLIDAY_RESPONSES.HOLIDAY_NOT_FOUND(
          updatePropertySeasonHolidayDto.holiday.id,
        ),
      );
    });
    it('should handle internal server errors', async () => {
      jest
        .spyOn(propertySeasonHolidayRepository, 'findOne')
        .mockRejectedValue(new Error('Test Error'));

      await expect(
        service.updatePropertySeasonHoliday(1, updatePropertySeasonHolidayDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('removePropertySeasonHoliday', () => {
    it('should log a message and return not found response if property season holiday is not found', async () => {
      const propertySeasonHolidayId = 1;
      jest
        .spyOn(propertySeasonHolidayRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 0 });
      const loggerErrorSpy = jest.spyOn(logger, 'error');
      const expectedResponse =
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_NOT_FOUND(
          propertySeasonHolidayId,
        );

      const result = await service.removePropertySeasonHoliday(
        propertySeasonHolidayId,
      );

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Property Season Holiday with ID ${propertySeasonHolidayId} not found`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should log a message and return success response if property season holiday is deleted successfully', async () => {
      const propertySeasonHolidayId = 1;
      jest
        .spyOn(propertySeasonHolidayRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 1 });
      const loggerLogSpy = jest.spyOn(logger, 'log');
      const expectedResponse =
        PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_DELETED(
          propertySeasonHolidayId,
        );

      const result = await service.removePropertySeasonHoliday(
        propertySeasonHolidayId,
      );

      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Property Season Holiday with ID ${propertySeasonHolidayId} deleted successfully`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle internal server errors', async () => {
      jest
        .spyOn(propertySeasonHolidayRepository, 'delete')
        .mockRejectedValue(new Error('Test Error'));

      await expect(service.removePropertySeasonHoliday(1)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
