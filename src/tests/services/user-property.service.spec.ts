import { Test, TestingModule } from '@nestjs/testing';
import { UserPropertyService } from 'src/main/service/user-property.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserProperties } from 'entities/user-properties.entity';
import { User } from 'src/main/entities/user.entity';
import { Properties } from 'src/main/entities/properties.entity';
import { LoggerService } from 'services/logger.service';
import { NotFoundException } from '@nestjs/common';
import { USER_PROPERTY_RESPONSES } from 'src/main/commons/constants/response-constants/user-property.response.constant';
import { Repository } from 'typeorm';
import { CreateUserPropertyDTO } from 'src/main/dto/requests/create-user-property.dto';
import { UpdateUserPropertyDTO } from 'src/main/dto/requests/update-user-property.dto';

describe('UserPropertyService', () => {
  let service: UserPropertyService;
  let userPropertyRepository: Repository<UserProperties>;
  let userRepository: Repository<User>;
  let propertyRepository: Repository<Properties>;
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
          provide: getRepositoryToken(User),
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
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserPropertyService>(UserPropertyService);
    userPropertyRepository = module.get<Repository<UserProperties>>(
      getRepositoryToken(UserProperties),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    propertyRepository = module.get<Repository<Properties>>(
      getRepositoryToken(Properties),
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

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as User);
      jest
        .spyOn(propertyRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as Properties);
      jest.spyOn(userPropertyRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userPropertyRepository, 'save').mockResolvedValue({
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

    it('should throw an error if user is not found', async () => {
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

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.createUserProperty(createUserPropertyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if property is not found', async () => {
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
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as User);
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.createUserProperty(createUserPropertyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if createdBy user is not found', async () => {
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
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce({ id: 1 } as User);
      jest
        .spyOn(propertyRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as Properties);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        service.createUserProperty(createUserPropertyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return already exists response if user property already exists', async () => {
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
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as User);
      jest
        .spyOn(propertyRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as Properties);
      jest
        .spyOn(userPropertyRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as UserProperties);

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
      jest
        .spyOn(userPropertyRepository, 'find')
        .mockResolvedValue(userProperties);

      const result = await service.getUserProperties();

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTIES_FETCHED(userProperties),
      );
      expect(logger.log).toHaveBeenCalledWith('Fetching all user properties');
    });

    it('should return not found response if no user properties are found', async () => {
      jest.spyOn(userPropertyRepository, 'find').mockResolvedValue([]);

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
      jest
        .spyOn(userPropertyRepository, 'findOne')
        .mockResolvedValue(userProperty);

      const result = await service.getUserPropertyById(1);

      expect(result).toEqual(userProperty);
      expect(logger.log).toHaveBeenCalledWith(
        'Fetching user property with ID 1',
      );
    });

    it('should throw an error if the user property is not found', async () => {
      jest.spyOn(userPropertyRepository, 'findOne').mockResolvedValue(null);

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
        updatedBy: { id: 1 } as User,
      };
      const userProperty = { id: 1, noOfShare: 1 } as UserProperties;
      jest
        .spyOn(userPropertyRepository, 'findOne')
        .mockResolvedValue(userProperty);
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as User);
      jest.spyOn(userPropertyRepository, 'save').mockResolvedValue({
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
        updatedBy: { id: 1 } as User,
      };
      jest.spyOn(userPropertyRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateUserProperty(1, updateUserPropertyDto),
      ).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith(
        'User property with ID 1 not found',
      );
    });

    it('should throw an error if user is not found', async () => {
      const updateUserPropertyDto: UpdateUserPropertyDTO = {
        noOfShare: 2,
        updatedBy: { id: 1 } as User,
      };
      const userProperty = { id: 1, noOfShare: 1 } as UserProperties;
      jest
        .spyOn(userPropertyRepository, 'findOne')
        .mockResolvedValue(userProperty);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateUserProperty(1, updateUserPropertyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if property is not found', async () => {
      const updateUserPropertyDto: UpdateUserPropertyDTO = {
        noOfShare: 2,
        property: { id: 1 } as Properties,
        updatedBy: { id: 1 } as User,
      };
      const userProperty = { id: 1, noOfShare: 1 } as UserProperties;
      jest
        .spyOn(userPropertyRepository, 'findOne')
        .mockResolvedValue(userProperty);
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateUserProperty(1, updateUserPropertyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if updatedBy user is not found', async () => {
      const updateUserPropertyDto: UpdateUserPropertyDTO = {
        noOfShare: 2,
        updatedBy: { id: 1 } as User,
      };
      const userProperty = { id: 1, noOfShare: 1 } as UserProperties;
      jest
        .spyOn(userPropertyRepository, 'findOne')
        .mockResolvedValue(userProperty);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        service.updateUserProperty(1, updateUserPropertyDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('deleteUserProperty', () => {
    it('should delete a user property', async () => {
      const deleteResult = { affected: 1, raw: [] };
      jest
        .spyOn(userPropertyRepository, 'delete')
        .mockResolvedValue(deleteResult);

      const result = await service.deleteUserProperty(1);

      expect(result).toEqual(USER_PROPERTY_RESPONSES.USER_PROPERTY_DELETED);
      expect(logger.log).toHaveBeenCalledWith(
        'User property with ID 1 deleted',
      );
    });

    it('should throw an error if the user property is not found', async () => {
      const deleteResult = { affected: 0, raw: [] };
      jest
        .spyOn(userPropertyRepository, 'delete')
        .mockResolvedValue(deleteResult);

      await expect(service.deleteUserProperty(1)).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'User property with ID 1 not found',
      );
    });
  });
});
