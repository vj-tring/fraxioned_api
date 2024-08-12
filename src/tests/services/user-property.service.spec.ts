import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserPropertyService } from 'services/user-property.service';
import { UserProperties } from 'entities/user-properties.entity';
import { User } from 'entities/user.entity';
import { Property } from 'entities/property.entity';
import { Repository } from 'typeorm';
import { LoggerService } from 'services/logger.service';
import { CreateUserPropertyDTO } from 'src/main/dto/requests/create-user-property.dto';
import { USER_PROPERTY_RESPONSES } from 'src/main/commons/constants/response-constants/user-property.constant';
import { UpdateUserPropertyDTO } from 'src/main/dto/requests/update-user-property.dto';

describe('UserPropertyService', () => {
  let service: UserPropertyService;
  let userPropertyRepository: Repository<UserProperties>;
  let userRepository: Repository<User>;
  let propertyRepository: Repository<Property>;
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
          provide: getRepositoryToken(Property),
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
    propertyRepository = module.get<Repository<Property>>(
      getRepositoryToken(Property),
    );
    logger = module.get<LoggerService>(LoggerService);
  });

  describe('createUserProperty', () => {
    it('should create a new user property', async () => {
      const createUserPropertyDto: CreateUserPropertyDTO = {
        user: { id: 1 } as User,
        property: { id: 1 } as Property,
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
        .mockResolvedValue({ id: 1 } as Property);
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

    it('should return USER_NOT_FOUND if user does not exist', async () => {
      const createUserPropertyDto: CreateUserPropertyDTO = {
        user: { id: 1 } as User,
        property: { id: 1 } as Property,
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

      const result = await service.createUserProperty(createUserPropertyDto);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_NOT_FOUND(createUserPropertyDto.user.id),
      );
    });

    it('should return PROPERTY_NOT_FOUND if property does not exist', async () => {
      const createUserPropertyDto: CreateUserPropertyDTO = {
        user: { id: 1 } as User,
        property: { id: 1 } as Property,
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

      const result = await service.createUserProperty(createUserPropertyDto);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(
          createUserPropertyDto.property.id,
        ),
      );
    });

    it('should return USER_PROPERTY_ALREADY_EXISTS if user property already exists', async () => {
      const createUserPropertyDto: CreateUserPropertyDTO = {
        user: { id: 1 } as User,
        property: { id: 1 } as Property,
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
        .mockResolvedValue({ id: 1 } as Property);
      jest
        .spyOn(userPropertyRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as UserProperties);

      const result = await service.createUserProperty(createUserPropertyDto);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTY_ALREADY_EXISTS(
          createUserPropertyDto.user.id,
          createUserPropertyDto.property.id,
          createUserPropertyDto.year,
        ),
      );
      expect(logger.warn).toHaveBeenCalledWith(
        `User property with user ID ${createUserPropertyDto.user.id}, property ID ${createUserPropertyDto.property.id}, and year ${createUserPropertyDto.year} already exists`,
      );
    });
  });

  describe('getUserProperties', () => {
    it('should fetch all user properties', async () => {
      const userProperties = [
        {
          id: 1,
          user: { id: 1 },
          property: { id: 1 },
          createdBy: { id: 1 },
          updatedBy: { id: 1 },
        } as UserProperties,
      ];

      jest
        .spyOn(userPropertyRepository, 'find')
        .mockResolvedValue(userProperties);

      const result = await service.getUserProperties();

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTIES_FETCHED(userProperties),
      );
      expect(logger.log).toHaveBeenCalledWith('Fetching all user properties');
    });

    it('should return USER_PROPERTIES_NOT_FOUND if no user properties are found', async () => {
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
      const userProperty = {
        id: 1,
        user: { id: 1 },
        property: { id: 1 },
        createdBy: { id: 1 },
        updatedBy: { id: 1 },
      } as UserProperties;

      jest
        .spyOn(userPropertyRepository, 'findOne')
        .mockResolvedValue(userProperty);

      const result = await service.getUserPropertyById(1);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTY_FETCHED(userProperty),
      );
      expect(logger.log).toHaveBeenCalledWith(
        'Fetching user property with ID 1',
      );
    });

    it('should return USER_PROPERTY_NOT_FOUND if user property is not found', async () => {
      jest.spyOn(userPropertyRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getUserPropertyById(1);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTY_NOT_FOUND(1),
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

    it('should return USER_PROPERTY_NOT_FOUND if user property is not found', async () => {
      const updateUserPropertyDto: UpdateUserPropertyDTO = {
        noOfShare: 2,
        updatedBy: { id: 1 } as User,
      };

      jest.spyOn(userPropertyRepository, 'findOne').mockResolvedValue(null);

      const result = await service.updateUserProperty(1, updateUserPropertyDto);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTY_NOT_FOUND(1),
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'User property with ID 1 not found',
      );
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

    it('should return USER_PROPERTY_NOT_FOUND if user property is not found', async () => {
      const deleteResult = { affected: 0, raw: [] };
      jest
        .spyOn(userPropertyRepository, 'delete')
        .mockResolvedValue(deleteResult);

      const result = await service.deleteUserProperty(1);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTY_NOT_FOUND(1),
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'User property with ID 1 not found',
      );
    });
  });
});
