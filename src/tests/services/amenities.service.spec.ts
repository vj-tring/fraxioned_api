import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from 'src/main/service/logger.service';
import { User } from 'src/main/entities/user.entity';
import { Role } from 'src/main/entities/role.entity';
import { AmenitiesService } from 'src/main/service/amenities.service';
import { Amenities } from 'src/main/entities/amenities.entity';
import { PropertyAmenities } from 'src/main/entities/property_amenities.entity';
import { AMENITIES_RESPONSES } from 'src/main/commons/constants/response-constants/amenities.constant';
import { CreateAmenitiesDto } from 'src/main/dto/requests/amenity/create-amenities.dto';
import { UpdateAmenitiesDto } from 'src/main/dto/requests/amenity/update-amenities.dto';

describe('AmenitiesService', () => {
  let service: AmenitiesService;
  let amenityRepository: Repository<Amenities>;
  let usersRepository: Repository<User>;
  let propertyAmenityRepository: Repository<PropertyAmenities>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmenitiesService,
        {
          provide: getRepositoryToken(Amenities),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PropertyAmenities),
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

    service = module.get<AmenitiesService>(AmenitiesService);
    amenityRepository = module.get<Repository<Amenities>>(
      getRepositoryToken(Amenities),
    );
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    propertyAmenityRepository = module.get<Repository<PropertyAmenities>>(
      getRepositoryToken(PropertyAmenities),
    );
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const createAmenityDto: CreateAmenitiesDto = {
    amenityName: 'Test Amenity',
    amenityDescription: 'Test Amenity Description',
    amenityType: 'Test Amenity Type',
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

  const updateAmenitiesDto: UpdateAmenitiesDto = {
    amenityName: ' Updated Test Amenity',
    amenityDescription: 'Test Amenity Description',
    amenityType: 'Test Amenity Type',
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

  describe('createAmenity', () => {
    it('should create an amenity', async () => {
      const user = { id: 1 } as User;
      const amenity = { id: 1 } as Amenities;
      const expectedResult = AMENITIES_RESPONSES.AMENITY_CREATED(
        amenity,
        createAmenityDto.amenityName,
        amenity.id,
      );
      jest.spyOn(amenityRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(amenityRepository, 'create').mockReturnValue(amenity);
      jest.spyOn(amenityRepository, 'save').mockResolvedValueOnce(amenity);

      expect(await service.createAmenity(createAmenityDto)).toEqual(
        expectedResult,
      );
    });

    it('should return conflict if amenity already exists', async () => {
      const existingAmenity = { id: 1 } as Amenities;

      jest
        .spyOn(amenityRepository, 'findOne')
        .mockResolvedValueOnce(existingAmenity);

      const expectedResult = AMENITIES_RESPONSES.AMENITY_ALREADY_EXISTS(
        createAmenityDto.amenityName,
        createAmenityDto.amenityType,
      );
      expect(await service.createAmenity(createAmenityDto)).toEqual(
        expectedResult,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Error creating amenity: Amenity ${createAmenityDto.amenityName} for the type ${createAmenityDto.amenityType} already exists`,
      );
    });

    it('should return not found if user does not exist', async () => {
      jest.spyOn(amenityRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = AMENITIES_RESPONSES.USER_NOT_FOUND(
        createAmenityDto.createdBy.id,
      );

      expect(await service.createAmenity(createAmenityDto)).toEqual(
        expectedResult,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${createAmenityDto.createdBy.id} does not exist`,
      );
    });

    it('should handle errors during creation', async () => {
      jest
        .spyOn(amenityRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.createAmenity(createAmenityDto)).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findAllAmenities', () => {
    it('should get all amenity records', async () => {
      const amenities: Amenities[] = [
        {
          id: 1,
          amenityName: 'Test Amenity 1',
          amenityDescription: 'Test Amenity Description',
          amenityType: 'Test Amenity Type',
          createdBy: { id: 1 } as User,
          updatedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          amenityName: 'Test Amenity 2',
          amenityDescription: 'Test Amenity Description',
          amenityType: 'Test Amenity Type',
          createdBy: { id: 1 } as User,
          updatedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const expectedResult = AMENITIES_RESPONSES.AMENITIES_FETCHED(amenities);

      jest.spyOn(amenityRepository, 'find').mockResolvedValue(amenities);

      expect(await service.findAllAmenities()).toEqual(expectedResult);
    });

    it('should return no amenities if no amenity found', async () => {
      const amenities: Amenities[] = [];
      const expectedResult = AMENITIES_RESPONSES.AMENITIES_NOT_FOUND();

      jest.spyOn(amenityRepository, 'find').mockResolvedValue(amenities);

      expect(await service.findAllAmenities()).toEqual(expectedResult);
    });

    it('should handle errors during retrieval of all amenities', async () => {
      jest
        .spyOn(amenityRepository, 'find')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.findAllAmenities()).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findAmenityById', () => {
    it('should find amenity by Id', async () => {
      const amenity = { id: 1 } as Amenities;
      const expectedResult = AMENITIES_RESPONSES.AMENITY_FETCHED(
        amenity,
        amenity.id,
      );

      jest.spyOn(amenityRepository, 'findOne').mockResolvedValue(amenity);
      const id = 1;
      expect(await service.findAmenityById(id)).toEqual(expectedResult);
    });

    it('should return no amenity exists for the given id', async () => {
      jest.spyOn(amenityRepository, 'findOne').mockResolvedValueOnce(null);
      const id = 1;
      const expectedResult = AMENITIES_RESPONSES.AMENITY_NOT_FOUND(id);

      expect(await service.findAmenityById(id)).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Amenity with ID ${id} not found`,
      );
    });

    it('should handle errors during retrieval of an amenity', async () => {
      jest
        .spyOn(amenityRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));
      const id = 1;
      await expect(service.findAmenityById(id)).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateAmenityDetailById', () => {
    it('should update amenity details', async () => {
      const amenity = { id: 1 } as Amenities;
      const user = { id: 1 } as User;
      const expectedResult = AMENITIES_RESPONSES.AMENITY_UPDATED(
        amenity,
        amenity.id,
      );

      jest.spyOn(amenityRepository, 'findOne').mockResolvedValueOnce(amenity);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(amenityRepository, 'save').mockResolvedValueOnce(amenity);

      expect(
        await service.updateAmenityDetailById(1, updateAmenitiesDto),
      ).toEqual(expectedResult);
    });

    it('should return amenity not found if amenity does not exist', async () => {
      const id = 1;
      jest.spyOn(amenityRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = AMENITIES_RESPONSES.AMENITY_NOT_FOUND(id);

      expect(
        await service.updateAmenityDetailById(1, updateAmenitiesDto),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Amenity with ID ${id} not found`,
      );
    });

    it('should return user not found if user does not exist', async () => {
      const amenity = { id: 1 } as Amenities;

      jest.spyOn(amenityRepository, 'findOne').mockResolvedValueOnce(amenity);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = AMENITIES_RESPONSES.USER_NOT_FOUND(
        updateAmenitiesDto.updatedBy.id,
      );

      expect(
        await service.updateAmenityDetailById(1, updateAmenitiesDto),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${updateAmenitiesDto.updatedBy.id} does not exist`,
      );
    });
    it('should handle errors during update of a amenity', async () => {
      jest
        .spyOn(amenityRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        service.updateAmenityDetailById(1, updateAmenitiesDto),
      ).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteAmenityById', () => {
    it('should log a message and return foreign key conflict response if amenity is mapped to a property', async () => {
      const amenityId = 1;
      const mockPropertyAmenity = new PropertyAmenities();
      mockPropertyAmenity.id = amenityId;

      jest
        .spyOn(propertyAmenityRepository, 'findOne')
        .mockResolvedValue(mockPropertyAmenity);
      const loggerSpy = jest.spyOn(logger, 'log');
      const expectedResponse =
        AMENITIES_RESPONSES.AMENITY_FOREIGN_KEY_CONFLICT(amenityId);

      const result = await service.deleteAmenityById(amenityId);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Amenity ID ${amenityId} exists and is mapped to property, hence cannot be deleted.`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should log a message and return amenity not found response if amenity is not found', async () => {
      const amenityId = 1;

      jest.spyOn(propertyAmenityRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(amenityRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 0 });
      const loggerErrorSpy = jest.spyOn(logger, 'error');
      const expectedResponse = AMENITIES_RESPONSES.AMENITY_NOT_FOUND(amenityId);

      const result = await service.deleteAmenityById(amenityId);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Amenity with ID ${amenityId} not found`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should log a message and return success response if amenity is deleted successfully', async () => {
      const amenityId = 1;

      jest.spyOn(propertyAmenityRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(amenityRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 1 });
      const loggerLogSpy = jest.spyOn(logger, 'log');
      const expectedResponse = AMENITIES_RESPONSES.AMENITY_DELETED(amenityId);

      const result = await service.deleteAmenityById(amenityId);

      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Amenity with ID ${amenityId} deleted successfully`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw an HttpException if an error occurs during deletion of amenity', async () => {
      const amenityId = 1;
      const error = new Error('An error occurred');

      jest.spyOn(propertyAmenityRepository, 'findOne').mockRejectedValue(error);
      const loggerErrorSpy = jest.spyOn(logger, 'error');

      try {
        await service.deleteAmenityById(amenityId);
      } catch (err) {
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          `Error deleting amenity with ID ${amenityId}: ${error.message} - ${error.stack}`,
        );
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while deleting the amenity',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
