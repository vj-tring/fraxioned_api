import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserProperties } from 'entities/user-properties.entity';
import { LoggerService } from 'services/logger.service';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateUserPropertyDTO } from 'dto/requests/create-user-property.dto';
import { UpdateUserPropertyDTO } from 'dto/requests/update-user-property.dto';
import { USER_PROPERTY_RESPONSES } from 'src/main/commons/constants/response-constants/user-property.response.constant';
import { User } from 'src/main/entities/user.entity';
import { UserPropertyService } from 'src/main/service/user-property.service';
import { Properties } from 'src/main/entities/properties.entity';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

describe('UserPropertyService', () => {
  let service: UserPropertyService;
  let repository: Repository<UserProperties>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPropertyService,
        {
          provide: getRepositoryToken(UserProperties),
          useClass: Repository,
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserPropertyService>(UserPropertyService);
    repository = module.get<Repository<UserProperties>>(
      getRepositoryToken(UserProperties),
    );
    logger = module.get<LoggerService>(LoggerService);
  });

  describe('createUserProperty', () => {
    it('should create a new user property', async () => {
      const createUserPropertyDto: CreateUserPropertyDTO = {
        user: { id: 1 } as User,
        property: { id: 1 } as Properties,
        noOfShare: 1,
        acquisitionDate: new Date(),
        isActive: true,
        year: 2023,
        peakAllottedNights: 10,
        peakUsedNights: 5,
        peakBookedNights: 5,
        peakCancelledNights: 0,
        peakLostNights: 0,
        peakRemainingNights: 5,
        peakAllottedHolidayNights: 5,
        peakUsedHolidayNights: 2,
        peakBookedHolidayNights: 2,
        peakRemainingHolidayNights: 3,
        peakCancelledHolidayNights: 0,
        peakLostHolidayNights: 0,
        offAllottedNights: 10,
        offUsedNights: 5,
        offBookedNights: 5,
        offCancelledNights: 0,
        offLostNights: 0,
        offRemainingNights: 5,
        offAllottedHolidayNights: 5,
        offUsedHolidayNights: 2,
        offBookedHolidayNights: 2,
        offRemainingHolidayNights: 3,
        offCancelledHolidayNights: 0,
        offLostHolidayNights: 0,
        lastMinuteAllottedNights: 5,
        lastMinuteUsedNights: 2,
        lastMinuteBookedNights: 2,
        lastMinuteRemainingNights: 3,
        createdBy: { id: 1 } as User,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'save').mockResolvedValue({
        id: 1,
        ...createUserPropertyDto,
      } as UserProperties);

      const result = await service.createUserProperty(createUserPropertyDto);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTY_CREATED({
          id: 1,
          ...createUserPropertyDto,
        }),
      );
      expect(logger.log).toHaveBeenCalledWith(
        'User property created with ID 1',
      );
    });

    it('should return an error if the user property already exists', async () => {
      const createUserPropertyDto: CreateUserPropertyDTO = {
        user: { id: 1 } as User,
        property: { id: 1 } as Properties,
        noOfShare: 1,
        acquisitionDate: new Date(),
        isActive: true,
        year: 2023,
        peakAllottedNights: 10,
        peakUsedNights: 5,
        peakBookedNights: 5,
        peakCancelledNights: 0,
        peakLostNights: 0,
        peakRemainingNights: 5,
        peakAllottedHolidayNights: 5,
        peakUsedHolidayNights: 2,
        peakBookedHolidayNights: 2,
        peakRemainingHolidayNights: 3,
        peakCancelledHolidayNights: 0,
        peakLostHolidayNights: 0,
        offAllottedNights: 10,
        offUsedNights: 5,
        offBookedNights: 5,
        offCancelledNights: 0,
        offLostNights: 0,
        offRemainingNights: 5,
        offAllottedHolidayNights: 5,
        offUsedHolidayNights: 2,
        offBookedHolidayNights: 2,
        offRemainingHolidayNights: 3,
        offCancelledHolidayNights: 0,
        offLostHolidayNights: 0,
        lastMinuteAllottedNights: 5,
        lastMinuteUsedNights: 2,
        lastMinuteBookedNights: 2,
        lastMinuteRemainingNights: 3,
        createdBy: { id: 1 } as User,
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(createUserPropertyDto as UserProperties);

      const result = await service.createUserProperty(createUserPropertyDto);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTY_ALREADY_EXISTS(1, 1, 2023),
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'User property with user ID 1, property ID 1, and year 2023 already exists',
      );
    });
  });

  describe('getUserProperties', () => {
    it('should fetch all user properties', async () => {
      const userProperties = [{ id: 1 } as UserProperties];
      jest.spyOn(repository, 'find').mockResolvedValue(userProperties);

      const result = await service.getUserProperties();

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTIES_FETCHED(userProperties),
      );
      expect(logger.log).toHaveBeenCalledWith('Fetching all user properties');
    });

    it('should return an error if no user properties are found', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await service.getUserProperties();

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTIES_NOT_FOUND(),
      );
      expect(logger.warn).toHaveBeenCalledWith('No user properties found');
    });
  });

  describe('getUserPropertyById', () => {
    it('should fetch a user property by ID', async () => {
      const userProperty = { id: 1 } as UserProperties;
      jest.spyOn(repository, 'findOne').mockResolvedValue(userProperty);

      const result = await service.getUserPropertyById(1);

      expect(result).toEqual(userProperty);
      expect(logger.log).toHaveBeenCalledWith(
        'Fetching user property with ID 1',
      );
    });

    it('should throw an error if the user property is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.getUserPropertyById(1)).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'User property with ID 1 not found',
      );
    });
  });

  describe('updateUserProperty', () => {
    it('should update a user property', async () => {
      const updateUserPropertyDto: UpdateUserPropertyDTO = {
        noOfShare: 2,
        updatedBy: new User(),
      };
      const userProperty = { id: 1, noOfShare: 1 } as UserProperties;
      jest.spyOn(repository, 'findOne').mockResolvedValue(userProperty);
      jest.spyOn(repository, 'save').mockResolvedValue({
        id: 1,
        ...updateUserPropertyDto,
      } as UserProperties);

      const result = await service.updateUserProperty(1, updateUserPropertyDto);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTY_UPDATED({
          id: 1,
          ...updateUserPropertyDto,
        }),
      );
      expect(logger.log).toHaveBeenCalledWith(
        'User property with ID 1 updated',
      );
    });

    it('should throw an error if the user property is not found', async () => {
      const updateUserPropertyDto: UpdateUserPropertyDTO = {
        noOfShare: 2,
        updatedBy: new User(),
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateUserProperty(1, updateUserPropertyDto),
      ).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith(
        'User property with ID 1 not found',
      );
    });
  });

  describe('deleteUserProperty', () => {
    it('should delete a user property', async () => {
      const deleteResult: DeleteResult = { affected: 1, raw: [] };
      jest.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      const result = await service.deleteUserProperty(1);

      expect(result).toEqual(USER_PROPERTY_RESPONSES.USER_PROPERTY_DELETED);
      expect(logger.log).toHaveBeenCalledWith(
        'User property with ID 1 deleted',
      );
    });

    it('should throw an error if the user property is not found', async () => {
      const deleteResult: DeleteResult = { affected: 0, raw: [] };
      jest.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      await expect(service.deleteUserProperty(1)).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'User property with ID 1 not found',
      );
    });
  });
});
