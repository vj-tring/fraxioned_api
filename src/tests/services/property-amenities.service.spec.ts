import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from 'src/main/service/logger.service';
import { User } from 'src/main/entities/user.entity';
import { Property } from 'src/main/entities/property.entity';
import { PropertyAmenitiesService } from 'src/main/service/property-amenities.service';
import { PropertyAmenities } from 'src/main/entities/property_amenities.entity';
import { Amenities } from 'src/main/entities/amenities.entity';
import { PROPERTY_AMENITY_RESPONSES } from 'src/main/commons/constants/response-constants/property-amenities.constant';
import { CreatePropertyAmenitiesDto } from 'src/main/dto/requests/property-amenity/create-property-amenities.dto';
import { UpdatePropertyAmenitiesDto } from 'src/main/dto/requests/property-amenity/update-property-amenities.dto';
import { CreateOrDeletePropertyAmenitiesDto } from 'src/main/dto/requests/property-amenity/create-or-delete-property-amenities.dto';

describe('PropertyAmenitiesService', () => {
  let service: PropertyAmenitiesService;
  let propertyAmenitiesRepository: Repository<PropertyAmenities>;
  let usersRepository: Repository<User>;
  let amenityRepository: Repository<Amenities>;
  let propertyRepository: Repository<Property>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyAmenitiesService,
        {
          provide: getRepositoryToken(PropertyAmenities),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Amenities),
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
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PropertyAmenitiesService>(PropertyAmenitiesService);
    propertyAmenitiesRepository = module.get<Repository<PropertyAmenities>>(
      getRepositoryToken(PropertyAmenities),
    );
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    amenityRepository = module.get<Repository<Amenities>>(
      getRepositoryToken(Amenities),
    );
    propertyRepository = module.get<Repository<Property>>(
      getRepositoryToken(Property),
    );
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const createPropertyAmenityDto: CreatePropertyAmenitiesDto = {
    property: {
      id: 1,
    } as Property,
    amenity: {
      id: 1,
    } as Amenities,
    createdBy: {
      id: 1,
    } as User,
  };

  const updatePropertyAmenityDto: UpdatePropertyAmenitiesDto = {
    property: {
      id: 1,
    } as Property,
    amenity: {
      id: 1,
    } as Amenities,
    updatedBy: {
      id: 1,
    } as User,
  };

  const user = { id: 1 } as User;
  const property = { id: 1 } as Property;
  const amenity = { id: 1 } as Amenities;
  const amenities = [{ id: 1 }, { id: 2 }] as Amenities[];
  const existingMappings = [
    {
      id: 1,
      amenity: { id: 1 } as Amenities,
      property: { id: 1 } as Property,
      createdBy: { id: 1 } as User,
      updatedBy: { id: 1 } as User,
    },
  ];
  const propertyAmenity = { id: 1 } as PropertyAmenities;

  const dto: CreateOrDeletePropertyAmenitiesDto = {
    updatedBy: user,
    property: property,
    amenities: amenities,
  };
  const dto2: CreateOrDeletePropertyAmenitiesDto = {
    updatedBy: user,
    property: property,
    amenities: [{ id: 2 }] as Amenities[],
  };

  describe('createPropertyAmenity', () => {
    it('should create a property amenity', async () => {
      const expectedResult =
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_CREATED(
          propertyAmenity,
          propertyAmenity.id,
        );

      jest.spyOn(propertyRepository, 'findOne').mockResolvedValueOnce(property);
      jest.spyOn(amenityRepository, 'findOne').mockResolvedValueOnce(amenity);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertyAmenitiesRepository, 'findOne')
        .mockResolvedValue(null);
      jest
        .spyOn(propertyAmenitiesRepository, 'create')
        .mockReturnValue(propertyAmenity);
      jest
        .spyOn(propertyAmenitiesRepository, 'save')
        .mockResolvedValueOnce(propertyAmenity);

      expect(
        await service.createPropertyAmenity(createPropertyAmenityDto),
      ).toEqual(expectedResult);
    });

    it('should return property not found if property does not exist', async () => {
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = PROPERTY_AMENITY_RESPONSES.PROPERTY_NOT_FOUND(
        createPropertyAmenityDto.property.id,
      );

      expect(
        await service.createPropertyAmenity(createPropertyAmenityDto),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Property with ID ${createPropertyAmenityDto.property.id} does not exist`,
      );
    });

    it('should return amenity not found if amenity does not exist', async () => {
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValue(property);
      jest.spyOn(amenityRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = PROPERTY_AMENITY_RESPONSES.AMENITY_NOT_FOUND(
        createPropertyAmenityDto.amenity.id,
      );

      expect(
        await service.createPropertyAmenity(createPropertyAmenityDto),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Amenity with ID ${createPropertyAmenityDto.amenity.id} does not exist`,
      );
    });

    it('should return not found if user does not exist', async () => {
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValue(property);
      jest.spyOn(amenityRepository, 'findOne').mockResolvedValue(amenity);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      const expectedResult = PROPERTY_AMENITY_RESPONSES.USER_NOT_FOUND(
        createPropertyAmenityDto.createdBy.id,
      );

      expect(
        await service.createPropertyAmenity(createPropertyAmenityDto),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${createPropertyAmenityDto.createdBy.id} does not exist`,
      );
    });

    it('should return property amenity already exists if the mapping already exists', async () => {
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValue(property);
      jest.spyOn(amenityRepository, 'findOne').mockResolvedValue(amenity);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(propertyAmenitiesRepository, 'findOne')
        .mockResolvedValue({} as PropertyAmenities);

      expect(
        await service.createPropertyAmenity(createPropertyAmenityDto),
      ).toEqual(
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_ALREADY_EXISTS(
          createPropertyAmenityDto.property.id,
          createPropertyAmenityDto.amenity.id,
        ),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Error creating property amenity: Property ID ${createPropertyAmenityDto.property.id} with Amenity ID ${createPropertyAmenityDto.amenity.id} already exists`,
      );
    });

    it('should handle errors during creation', async () => {
      jest
        .spyOn(propertyAmenitiesRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        service.createPropertyAmenity(createPropertyAmenityDto),
      ).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findAllPropertySAmenities', () => {
    it('should get all property amenity records', async () => {
      const propertyAmenities: PropertyAmenities[] = [
        {
          id: 1,
          property: new Property(),
          amenity: new Amenities(),
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: undefined,
          updatedAt: undefined,
        },
        {
          id: 2,
          property: new Property(),
          amenity: new Amenities(),
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: undefined,
          updatedAt: undefined,
        },
      ];
      const expectedResult =
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITIES_FETCHED(
          propertyAmenities,
        );

      jest
        .spyOn(propertyAmenitiesRepository, 'find')
        .mockResolvedValue(propertyAmenities);

      expect(await service.findAllPropertySAmenities()).toEqual(expectedResult);
    });

    it('should return no property amenities if no property amenities found', async () => {
      const propertyAmenities: PropertyAmenities[] = [];
      const expectedResult =
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITIES_NOT_FOUND();

      jest
        .spyOn(propertyAmenitiesRepository, 'find')
        .mockResolvedValue(propertyAmenities);

      expect(await service.findAllPropertySAmenities()).toEqual(expectedResult);
    });

    it('should handle errors during retrieval of all property amenities', async () => {
      jest
        .spyOn(propertyAmenitiesRepository, 'find')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.findAllPropertySAmenities()).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findPropertyAmenityById', () => {
    it('should find property amenity by Id', async () => {
      const expectedResult =
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_FETCHED(
          propertyAmenity,
          propertyAmenity.id,
        );

      jest
        .spyOn(propertyAmenitiesRepository, 'findOne')
        .mockResolvedValue(propertyAmenity);
      expect(await service.findPropertyAmenityById(propertyAmenity.id)).toEqual(
        expectedResult,
      );
    });

    it('should return no property amenity exists for the given id', async () => {
      jest
        .spyOn(propertyAmenitiesRepository, 'findOne')
        .mockResolvedValueOnce(null);
      const id = 1;
      const expectedResult =
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_NOT_FOUND(id);

      expect(await service.findPropertyAmenityById(id)).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Property Amenity with ID ${id} not found`,
      );
    });

    it('should handle errors during retrieval of a property amenity', async () => {
      jest
        .spyOn(propertyAmenitiesRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));
      const id = 1;
      await expect(service.findPropertyAmenityById(id)).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findAmenitiesByPropertyId', () => {
    it('should retrieve all property amenities for a given property Id', async () => {
      const propertyId = 1;
      const propertyAmenities: PropertyAmenities[] = [
        {
          id: 1,
          property: { id: propertyId } as Property,
          amenity: new Amenities(),
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: undefined,
          updatedAt: undefined,
        },
        {
          id: 2,
          property: { id: propertyId } as Property,
          amenity: new Amenities(),
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: undefined,
          updatedAt: undefined,
        },
      ];
      const expectedResult =
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITIES_FETCHED(
          propertyAmenities,
        );

      jest
        .spyOn(propertyAmenitiesRepository, 'find')
        .mockResolvedValue(propertyAmenities);

      expect(await service.findAmenitiesByPropertyId(propertyId)).toEqual(
        expectedResult,
      );
    });

    it('should return no amenities found for a given property Id', async () => {
      const propertyId = 1;
      const propertyAmenities: PropertyAmenities[] = [];

      const expectedResult =
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITIES_NOT_FOUND();

      jest
        .spyOn(propertyAmenitiesRepository, 'find')
        .mockResolvedValue(propertyAmenities);

      expect(await service.findAmenitiesByPropertyId(propertyId)).toEqual(
        expectedResult,
      );
    });

    it('should handle errors during retrieval of amenities by property Id', async () => {
      const propertyId = 1;

      jest
        .spyOn(propertyAmenitiesRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        service.findAmenitiesByPropertyId(propertyId),
      ).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updatePropertyAmenity', () => {
    it('should update property amenity details', async () => {
      const expectedResult =
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_UPDATED(
          propertyAmenity,
          propertyAmenity.id,
        );

      jest
        .spyOn(propertyAmenitiesRepository, 'findOne')
        .mockResolvedValue(propertyAmenity);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValue(property);
      jest.spyOn(amenityRepository, 'findOne').mockResolvedValue(amenity);
      jest
        .spyOn(propertyAmenitiesRepository, 'save')
        .mockResolvedValue(propertyAmenity);

      expect(
        await service.updatePropertyAmenity(
          propertyAmenity.id,
          updatePropertyAmenityDto,
        ),
      ).toEqual(expectedResult);
    });

    it('should return property amenity not found if the property amenity does not exist', async () => {
      jest
        .spyOn(propertyAmenitiesRepository, 'findOne')
        .mockResolvedValue(null);

      const result = await service.updatePropertyAmenity(
        1,
        updatePropertyAmenityDto,
      );

      expect(result).toEqual(
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_NOT_FOUND(1),
      );
    });

    it('should return user not found if user does not exist', async () => {
      jest
        .spyOn(propertyAmenitiesRepository, 'findOne')
        .mockResolvedValueOnce(propertyAmenity);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = PROPERTY_AMENITY_RESPONSES.USER_NOT_FOUND(
        updatePropertyAmenityDto.updatedBy.id,
      );

      expect(
        await service.updatePropertyAmenity(1, updatePropertyAmenityDto),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${updatePropertyAmenityDto.updatedBy.id} does not exist`,
      );
    });

    it('should return property not found if the property does not exist', async () => {
      jest
        .spyOn(propertyAmenitiesRepository, 'findOne')
        .mockResolvedValue(propertyAmenity);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValue(null);

      const result = await service.updatePropertyAmenity(
        1,
        updatePropertyAmenityDto,
      );

      expect(result).toEqual(
        PROPERTY_AMENITY_RESPONSES.PROPERTY_NOT_FOUND(
          updatePropertyAmenityDto.property.id,
        ),
      );
    });

    it('should return amenity not found if the amenity does not exist', async () => {
      jest
        .spyOn(propertyAmenitiesRepository, 'findOne')
        .mockResolvedValue(propertyAmenity);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValue(property);
      jest.spyOn(amenityRepository, 'findOne').mockResolvedValue(null);

      const result = await service.updatePropertyAmenity(
        1,
        updatePropertyAmenityDto,
      );

      expect(result).toEqual(
        PROPERTY_AMENITY_RESPONSES.AMENITY_NOT_FOUND(
          updatePropertyAmenityDto.amenity.id,
        ),
      );
    });
    it('should handle internal server errors', async () => {
      jest
        .spyOn(propertyAmenitiesRepository, 'findOne')
        .mockRejectedValue(new Error('Test Error'));

      await expect(
        service.updatePropertyAmenity(1, updatePropertyAmenityDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('createOrDeletePropertyAmenities', () => {
    it('should return USER_NOT_FOUND if user does not exist', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      const result = await service.createOrDeletePropertyAmenities(dto);

      expect(result).toEqual(
        PROPERTY_AMENITY_RESPONSES.USER_NOT_FOUND(user.id),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${user.id} does not exist`,
      );
    });
    it('should return PROPERTY_NOT_FOUND if property does not exist', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValue(null);

      const result = await service.createOrDeletePropertyAmenities(dto);

      expect(result).toEqual(
        PROPERTY_AMENITY_RESPONSES.PROPERTY_NOT_FOUND(property.id),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Property with ID ${property.id} does not exist`,
      );
    });
    it('should return AMENITIES_NOT_FOUND if some amenities do not exist', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValue(property);
      jest.spyOn(amenityRepository, 'findBy').mockResolvedValue([amenity]);

      const result = await service.createOrDeletePropertyAmenities(dto);

      const nonExistingIds = [2];
      expect(result).toEqual(
        PROPERTY_AMENITY_RESPONSES.AMENITIES_NOT_FOUND(nonExistingIds),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Amenities with ID(s) ${nonExistingIds.join(', ')} do not exist`,
      );
    });

    it('should remove amenities not present in the update and save new ones', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValue(property);
      jest.spyOn(amenityRepository, 'findBy').mockResolvedValue(amenities);
      jest.spyOn(propertyAmenitiesRepository, 'find').mockResolvedValue([
        {
          id: 1,
          amenity: { id: 1 } as Amenities,
          property: property,
          createdBy: user,
          updatedBy: user,
        } as PropertyAmenities,
      ]);

      const removeSpy = jest
        .spyOn(propertyAmenitiesRepository, 'remove')
        .mockResolvedValue(null);
      const saveSpy = jest
        .spyOn(propertyAmenitiesRepository, 'save')
        .mockResolvedValue(null);

      const result = await service.createOrDeletePropertyAmenities(dto2);

      expect(removeSpy).toHaveBeenCalledWith([existingMappings[0]]);
      expect(saveSpy).toHaveBeenCalledWith([
        {
          amenity: { id: 2 } as Amenities,
          property: { id: 1 } as Property,
          createdBy: { id: 1 } as User,
          updatedBy: { id: 1 } as User,
        },
      ]);
      expect(result).toEqual(
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITIES_UPDATED(),
      );
    });

    it('should throw HttpException if an error occurs', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValue(property);
      jest.spyOn(amenityRepository, 'findBy').mockImplementation(() => {
        throw new Error('Some error');
      });

      await expect(
        service.createOrDeletePropertyAmenities(dto),
      ).rejects.toThrow(
        new HttpException(
          'An error occurred while creation or deletion of property amenities for the selected property',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('removePropertyAmenity', () => {
    it('should log a message and return not found response if property amenity is not found', async () => {
      const propertyAmenityId = 1;
      jest
        .spyOn(propertyAmenitiesRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 0 });
      const loggerErrorSpy = jest.spyOn(logger, 'error');
      const expectedResponse =
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_NOT_FOUND(
          propertyAmenityId,
        );

      const result = await service.removePropertyAmenity(propertyAmenityId);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Property Amenity with ID ${propertyAmenityId} not found`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should log a message and return success response if property amenity is deleted successfully', async () => {
      const propertyAmenityId = 1;
      jest
        .spyOn(propertyAmenitiesRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 1 });
      const loggerLogSpy = jest.spyOn(logger, 'log');
      const expectedResponse =
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_DELETED(propertyAmenityId);

      const result = await service.removePropertyAmenity(propertyAmenityId);

      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Property Amenity with ID ${propertyAmenityId} deleted successfully`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle internal server errors', async () => {
      jest
        .spyOn(propertyAmenitiesRepository, 'delete')
        .mockRejectedValue(new Error('Test Error'));

      await expect(service.removePropertyAmenity(1)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
