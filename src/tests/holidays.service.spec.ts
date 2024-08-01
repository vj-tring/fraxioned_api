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
import { Role } from 'src/main/entities/role.entity';

describe('HolidaysService', () => {
  let service: HolidaysService;
  let holidayRepository: Repository<Holidays>;
  let usersRepository: Repository<User>;
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
      const user = { id: 1 } as User;
      const holiday = { id: 1 } as Holidays;
      const expectedResult = {
        success: true,
        message: 'Holiday created successfully',
        data: holiday,
        statusCode: HttpStatus.CREATED,
      };

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
        createdBy: { id: 1 } as User,
      };
      const existingHoliday = { id: 1 } as Holidays;

      jest
        .spyOn(holidayRepository, 'findOne')
        .mockResolvedValueOnce(existingHoliday);

      const expectedResult = {
        success: false,
        message: `Holiday ${createHolidayDto.name} for the year ${createHolidayDto.year} already exists`,
        statusCode: HttpStatus.CONFLICT,
      };
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
        createdBy: { id: 1 } as User,
      };
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = {
        success: false,
        message: `User with ID ${createHolidayDto.createdBy.id} does not exist`,
        statusCode: HttpStatus.NOT_FOUND,
      };

      expect(await service.create(createHolidayDto)).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${createHolidayDto.createdBy.id} does not exist`,
      );
    });

    it('should handle errors during creation', async () => {
      const createHolidayDto: CreateHolidayDto = {
        name: 'Test Holiday',
        year: 2023,
        startDate: new Date(),
        endDate: new Date(),
        createdBy: { id: 1 } as User,
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
      const expectedResult = {
        success: true,
        message: 'Holidays retrieved successfully',
        data: holidays,
        statusCode: HttpStatus.OK,
      };

      jest.spyOn(holidayRepository, 'find').mockResolvedValue(holidays);

      expect(await service.getAllHolidayRecords()).toEqual(expectedResult);
    });

    it('should return no holidays if no holidays found', async () => {
      const holidays: Holidays[] = [];
      const expectedResult = {
        success: true,
        message: 'No holidays are available',
        data: [],
        statusCode: HttpStatus.OK,
      };

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
      const expectedResult = {
        success: true,
        message: 'Holiday retrieved successfully',
        data: holiday,
        statusCode: HttpStatus.OK,
      };

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValue(holiday);
      const id = 1;
      expect(await service.findHolidayById(id)).toEqual(expectedResult);
    });

    it('should return no holiday exists for the given id', async () => {
      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(null);
      const id = 1;
      const expectedResult = {
        success: false,
        message: `Holiday with ID ${id} not found`,
        statusCode: HttpStatus.NOT_FOUND,
      };

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
      const holiday = { id: 1 } as Holidays;
      const user = { id: 1 } as User;
      const expectedResult = {
        success: true,
        message: 'Holiday updated successfully',
        data: holiday,
        statusCode: HttpStatus.OK,
      };

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
        updatedBy: { id: 1 } as User,
      };

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = {
        success: false,
        message: `Holiday with ID 1 not found`,
        statusCode: HttpStatus.NOT_FOUND,
      };

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
        updatedBy: { id: 1 } as User,
      };

      const holiday = { id: 1 } as Holidays;

      jest.spyOn(holidayRepository, 'findOne').mockResolvedValueOnce(holiday);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = {
        success: false,
        message: `User with ID ${updateHolidayDto.updatedBy.id} does not exist`,
        statusCode: HttpStatus.NOT_FOUND,
      };

      expect(await service.updateHolidayDetail(1, updateHolidayDto)).toEqual(
        expectedResult,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${updateHolidayDto.updatedBy.id} does not exist`,
      );
    });
    it('should handle errors during update of a holiday', async () => {
      const updateHolidayDto: UpdateHolidayDto = {
        name: 'Updated Holiday',
        year: 2023,
        startDate: new Date(),
        endDate: new Date(),
        updatedBy: { id: 1 } as User,
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
    it('should delete holiday by id', async () => {
      const deleteResult = {
        raw: {},
        affected: 1,
      };
      const expectedResult = {
        success: true,
        message: `Holiday with ID ${deleteResult.affected} deleted successfully`,
        statusCode: HttpStatus.NO_CONTENT,
      };

      jest.spyOn(holidayRepository, 'delete').mockResolvedValue(deleteResult);

      expect(await service.deleteHolidayById(1)).toEqual(expectedResult);
    });

    it('should return not found if holiday with the given ID does not exist', async () => {
      const deleteResult = { raw: [], affected: 0 };
      const id = 1;
      const expectedResult = {
        success: false,
        message: `Holiday with ID ${id} not found`,
        statusCode: HttpStatus.NOT_FOUND,
      };

      jest.spyOn(holidayRepository, 'delete').mockResolvedValue(deleteResult);

      expect(await service.deleteHolidayById(id)).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Holiday with ID ${id} not found`,
      );
    });

    it('should handle errors during deletion of holiday by ID', async () => {
      jest
        .spyOn(holidayRepository, 'delete')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.deleteHolidayById(1)).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
