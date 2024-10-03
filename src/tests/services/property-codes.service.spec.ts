import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from 'src/main/service/logger.service';
import { User } from 'src/main/entities/user.entity';
import { PropertyCodesService } from 'src/main/service/property-codes.service';
import { PropertyCodes } from 'src/main/entities/property_codes.entity';
import { Property } from 'src/main/entities/property.entity';
import { PropertyCodeCategory } from 'src/main/entities/property-code-category.entity';
import { CreatePropertyCodeDto } from 'src/main/dto/requests/property-code/create-property-code.dto';
import { UpdatePropertyCodeDto } from 'src/main/dto/requests/property-code/update-property-code.dto';
import { PROPERTY_CODES_RESPONSES } from 'src/main/commons/constants/response-constants/property-codes.constant';
import { PropertyCodeCategoryService } from 'src/main/service/property-code-category.service';

describe('PropertyCodesService', () => {
  let service: PropertyCodesService;
  let propertyCodesRepository: Repository<PropertyCodes>;
  let propertyRepository: Repository<Property>;
  let userRepository: Repository<User>;
  let propertyCodeCategoryRepository: Repository<PropertyCodeCategory>;
  let logger: LoggerService;
  let propertyCodeCategoryService: PropertyCodeCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyCodesService,
        {
          provide: getRepositoryToken(PropertyCodes),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Property),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PropertyCodeCategory),
          useClass: Repository,
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: PropertyCodeCategoryService,
          useValue: {
            createPropertyCodeCategory: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PropertyCodesService>(PropertyCodesService);
    propertyCodesRepository = module.get<Repository<PropertyCodes>>(
      getRepositoryToken(PropertyCodes),
    );
    propertyRepository = module.get<Repository<Property>>(
      getRepositoryToken(Property),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    propertyCodeCategoryRepository = module.get<
      Repository<PropertyCodeCategory>
    >(getRepositoryToken(PropertyCodeCategory));
    logger = module.get<LoggerService>(LoggerService);
    propertyCodeCategoryService = module.get<PropertyCodeCategoryService>(
      PropertyCodeCategoryService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const createPropertyCodeDto: CreatePropertyCodeDto = {
    propertyCode: 'Test Code',
    propertyCodeCategory: {
      id: 1,
      name: 'Test Property Code Category',
    } as PropertyCodeCategory,
    createdBy: {
      id: 1,
    } as User,
    property: {
      id: 1,
    } as Property,
  };

  const createPropertyCodeDtoOther: CreatePropertyCodeDto = {
    propertyCode: 'Test Code',
    propertyCodeCategory: {
      id: 1,
      name: 'Test Property Code Other',
    } as PropertyCodeCategory,
    createdBy: {
      id: 1,
    } as User,
    property: {
      id: 1,
    } as Property,
  };

  const updatePropertyCodeDto: UpdatePropertyCodeDto = {
    propertyCode: 'Test Code',
    propertyCodeCategory: {
      id: 1,
    } as PropertyCodeCategory,
    updatedBy: {
      id: 1,
    } as User,
    property: {
      id: 1,
    } as Property,
  };

  const expectedPropertyCode: PropertyCodes = {
    id: 1,
    propertyCode: 'Test Code',
    propertyCodeCategory: { id: 1 } as PropertyCodeCategory,
    property: { id: 1 } as Property,
    createdBy: { id: 1 } as User,
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: undefined,
  };

  const expectedPropertyCode2: PropertyCodes = {
    id: 1,
    propertyCode: 'Test Property Code Other',
    propertyCodeCategory: { id: 2 } as PropertyCodeCategory,
    property: { id: 1 } as Property,
    createdBy: { id: 1 } as User,
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const expectedUpdatedPropertyCode: PropertyCodes = {
    id: 1,
    propertyCode: 'Test Code',
    propertyCodeCategory: { id: 1 } as PropertyCodeCategory,
    property: { id: 1 } as Property,
    createdBy: { id: 1 } as User,
    updatedBy: { id: 1 } as User,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const user = { id: 1 } as User;
  const propertyCodeCategory = {
    id: 1,
    name: 'Test Property Code Category',
  } as PropertyCodeCategory;
  const propertyCodeCategory2 = {
    id: 1,
    name: 'Other',
  } as PropertyCodeCategory;
  const property = { id: 1 } as Property;
  const savedPropertyCodeCategoryOther: PropertyCodeCategory = {
    id: 2,
    name: 'Test Property Code Other',
    createdBy: { id: 1 } as User,
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    propertyCodes: [],
  };

  describe('createPropertyCodes', () => {
    it('should create a property code', async () => {
      const expectedResult =
        PROPERTY_CODES_RESPONSES.PROPERTY_CODE_CREATED(expectedPropertyCode);

      jest.spyOn(propertyRepository, 'findOne').mockResolvedValueOnce(property);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertyCodeCategoryRepository, 'findOne')
        .mockResolvedValueOnce(propertyCodeCategory);
      jest
        .spyOn(propertyCodesRepository, 'create')
        .mockReturnValue(expectedPropertyCode);
      jest
        .spyOn(propertyCodesRepository, 'save')
        .mockResolvedValueOnce(expectedPropertyCode);
      jest
        .spyOn(propertyCodesRepository, 'create')
        .mockReturnValue(expectedPropertyCode);
      jest
        .spyOn(propertyCodesRepository, 'save')
        .mockResolvedValueOnce(expectedPropertyCode);

      expect(await service.createPropertyCodes(createPropertyCodeDto)).toEqual(
        expectedResult,
      );
    });

    it('should return PROPERTY_NOT_FOUND when property does not exist', async () => {
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.createPropertyCodes(createPropertyCodeDto);

      expect(result).toEqual(
        PROPERTY_CODES_RESPONSES.PROPERTY_NOT_FOUND(
          createPropertyCodeDto.property.id,
        ),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Property with ID ${createPropertyCodeDto.property.id} does not exist`,
      );
    });

    it('should return USER_NOT_FOUND when user does not exist', async () => {
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValueOnce(property);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.createPropertyCodes(createPropertyCodeDto);

      expect(result).toEqual(
        PROPERTY_CODES_RESPONSES.USER_NOT_FOUND(
          createPropertyCodeDto.createdBy.id,
        ),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${createPropertyCodeDto.createdBy.id} does not exist`,
      );
    });

    it('should return PROPERTY_CODE_CATEGORY_NOT_FOUND when property code category does not exist', async () => {
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValueOnce(property);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertyCodeCategoryRepository, 'findOne')
        .mockResolvedValueOnce(null);

      const result = await service.createPropertyCodes(createPropertyCodeDto);

      expect(result).toEqual(
        PROPERTY_CODES_RESPONSES.PROPERTY_CODE_CATEGORY_NOT_FOUND(
          createPropertyCodeDto.propertyCodeCategory.id,
        ),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Property Code Category with ID ${createPropertyCodeDto.propertyCodeCategory.id} does not exist`,
      );
    });
    it('should create a new property code category if name is "other" and return success', async () => {
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValueOnce(property);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertyCodeCategoryRepository, 'findOne')
        .mockResolvedValueOnce(propertyCodeCategory2);
      jest
        .spyOn(propertyCodeCategoryRepository, 'findOne')
        .mockResolvedValueOnce(propertyCodeCategory2);

      jest
        .spyOn(propertyCodeCategoryRepository, 'findOne')
        .mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertyCodeCategoryRepository, 'create')
        .mockReturnValue(savedPropertyCodeCategoryOther);
      jest
        .spyOn(propertyCodeCategoryRepository, 'save')
        .mockResolvedValueOnce(savedPropertyCodeCategoryOther);

      const result = await service.createPropertyCodes(
        createPropertyCodeDtoOther,
      );
      expect(result).toEqual(
        PROPERTY_CODES_RESPONSES.PROPERTY_CODE_CATEGORY_ALREADY_EXISTS(
          createPropertyCodeDtoOther.propertyCodeCategory.name,
        ),
      );
    });

    it('should create a new property code category when name is "other" and category does not exist', async () => {
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValueOnce(property);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertyCodeCategoryRepository, 'findOne')
        .mockResolvedValueOnce(propertyCodeCategory2)
        .mockResolvedValueOnce(null);

      const categoryResponse = {
        success: true,
        message: `Property code category ${savedPropertyCodeCategoryOther.name} created with ID ${savedPropertyCodeCategoryOther.id}`,
        data: savedPropertyCodeCategoryOther,
        statusCode: HttpStatus.CREATED,
      };
      jest
        .spyOn(propertyCodeCategoryService, 'createPropertyCodeCategory')
        .mockResolvedValueOnce(categoryResponse);

      jest
        .spyOn(propertyCodesRepository, 'create')
        .mockReturnValue(expectedPropertyCode2);
      jest
        .spyOn(propertyCodesRepository, 'save')
        .mockResolvedValueOnce(expectedPropertyCode2);

      const result = await service.createPropertyCodes(
        createPropertyCodeDtoOther,
      );

      expect(result).toEqual(
        PROPERTY_CODES_RESPONSES.PROPERTY_CODE_CREATED(expectedPropertyCode2),
      );
      expect(
        propertyCodeCategoryService.createPropertyCodeCategory,
      ).toHaveBeenCalledWith({
        createdBy: { id: createPropertyCodeDtoOther.createdBy.id },
        name: createPropertyCodeDtoOther.propertyCodeCategory.name,
      });
    });
    it('should handle errors during creation', async () => {
      jest
        .spyOn(propertyCodesRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        service.createPropertyCodes(createPropertyCodeDto),
      ).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findAllPropertyCodes', () => {
    it('should get all property code records', async () => {
      const expectedResult = PROPERTY_CODES_RESPONSES.PROPERTY_CODES_FETCHED([
        expectedPropertyCode,
      ]);

      jest
        .spyOn(propertyCodesRepository, 'find')
        .mockResolvedValue([expectedPropertyCode]);

      expect(await service.findAllPropertyCodes()).toEqual(expectedResult);
    });

    it('should return no property codes if no property code found', async () => {
      const expectedResult =
        PROPERTY_CODES_RESPONSES.PROPERTY_CODES_NOT_FOUND();

      jest
        .spyOn(propertyCodesRepository, 'find')
        .mockResolvedValue([] as PropertyCodes[]);

      expect(await service.findAllPropertyCodes()).toEqual(expectedResult);
    });

    it('should handle errors during retrieval of all property codes', async () => {
      jest
        .spyOn(propertyCodesRepository, 'find')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.findAllPropertyCodes()).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findPropertyCodeById', () => {
    it('should find property code by Id', async () => {
      const expectedResult = PROPERTY_CODES_RESPONSES.PROPERTY_CODE_FETCHED(
        expectedPropertyCode,
        expectedPropertyCode.id,
      );

      jest
        .spyOn(propertyCodesRepository, 'findOne')
        .mockResolvedValue(expectedPropertyCode);
      expect(
        await service.findPropertyCodeById(expectedPropertyCode.id),
      ).toEqual(expectedResult);
    });

    it('should return no property code exists for the given id', async () => {
      jest
        .spyOn(propertyCodesRepository, 'findOne')
        .mockResolvedValueOnce(null);
      const id = 1;
      const expectedResult =
        PROPERTY_CODES_RESPONSES.PROPERTY_CODE_NOT_FOUND(id);

      expect(await service.findPropertyCodeById(id)).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Property code with ID ${id} not found`,
      );
    });

    it('should handle errors during retrieval of a property code', async () => {
      jest
        .spyOn(propertyCodesRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));
      const id = 1;
      await expect(service.findPropertyCodeById(id)).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });
  describe('updatePropertyCodeById', () => {
    it('should update property code details', async () => {
      const expectedResult = PROPERTY_CODES_RESPONSES.PROPERTY_CODE_UPDATED(
        expectedUpdatedPropertyCode,
        expectedUpdatedPropertyCode.id,
      );

      jest
        .spyOn(propertyCodesRepository, 'findOne')
        .mockResolvedValue(expectedUpdatedPropertyCode);
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValueOnce(property);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(propertyCodeCategoryRepository, 'findOne')
        .mockResolvedValue(propertyCodeCategory);

      jest
        .spyOn(propertyCodesRepository, 'save')
        .mockResolvedValue(expectedUpdatedPropertyCode);

      expect(
        await service.updatePropertyCodeById(1, expectedUpdatedPropertyCode),
      ).toEqual(expectedResult);
    });

    it('should return property code not found if the property code does not exist', async () => {
      jest.spyOn(propertyCodesRepository, 'findOne').mockResolvedValue(null);

      const result = await service.updatePropertyCodeById(
        1,
        updatePropertyCodeDto,
      );

      expect(result).toEqual(
        PROPERTY_CODES_RESPONSES.PROPERTY_CODE_NOT_FOUND(1),
      );
    });

    it('should return property not found if property does not exist', async () => {
      jest
        .spyOn(propertyCodesRepository, 'findOne')
        .mockResolvedValueOnce(expectedUpdatedPropertyCode);
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = PROPERTY_CODES_RESPONSES.PROPERTY_NOT_FOUND(
        updatePropertyCodeDto.property.id,
      );

      expect(
        await service.updatePropertyCodeById(1, updatePropertyCodeDto),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Property with ID ${updatePropertyCodeDto.updatedBy.id} does not exist`,
      );
    });

    it('should return user not found if user does not exist', async () => {
      jest
        .spyOn(propertyCodesRepository, 'findOne')
        .mockResolvedValueOnce(expectedUpdatedPropertyCode);
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValueOnce(property);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = PROPERTY_CODES_RESPONSES.USER_NOT_FOUND(
        updatePropertyCodeDto.updatedBy.id,
      );

      expect(
        await service.updatePropertyCodeById(1, updatePropertyCodeDto),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${updatePropertyCodeDto.updatedBy.id} does not exist`,
      );
    });

    it('should return property code category not found if the property code category does not exist', async () => {
      jest
        .spyOn(propertyCodesRepository, 'findOne')
        .mockResolvedValue(expectedUpdatedPropertyCode);

      jest.spyOn(propertyRepository, 'findOne').mockResolvedValueOnce(property);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(propertyCodeCategoryRepository, 'findOne')
        .mockResolvedValue(null);

      const result = await service.updatePropertyCodeById(
        1,
        updatePropertyCodeDto,
      );

      expect(result).toEqual(
        PROPERTY_CODES_RESPONSES.PROPERTY_CODE_CATEGORY_NOT_FOUND(
          updatePropertyCodeDto.propertyCodeCategory.id,
        ),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Property Code Category with ID ${updatePropertyCodeDto.propertyCodeCategory.id} does not exist`,
      );
    });

    it('should handle errors during updation of a property code', async () => {
      jest
        .spyOn(propertyCodesRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));
      const id = 1;
      await expect(
        service.updatePropertyCodeById(id, updatePropertyCodeDto),
      ).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });
  describe('removePropertyCode', () => {
    it('should log a message and return not found response if proeprty code is not found', async () => {
      const propertyCodeId = 1;
      jest
        .spyOn(propertyCodesRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 0 });
      const loggerErrorSpy = jest.spyOn(logger, 'error');
      const expectedResponse =
        PROPERTY_CODES_RESPONSES.PROPERTY_CODE_NOT_FOUND(propertyCodeId);

      const result = await service.removePropertyCode(propertyCodeId);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Property code with ID ${propertyCodeId} not found`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should log a message and return success response if property code is deleted successfully', async () => {
      const propertyCodeId = 1;
      jest
        .spyOn(propertyCodesRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 1 });
      const loggerLogSpy = jest.spyOn(logger, 'log');
      const expectedResponse =
        PROPERTY_CODES_RESPONSES.PROPERTY_CODE_DELETED(propertyCodeId);

      const result = await service.removePropertyCode(propertyCodeId);

      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Property code with ID ${propertyCodeId} deleted successfully`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle internal server errors', async () => {
      jest
        .spyOn(propertyCodesRepository, 'delete')
        .mockRejectedValue(new Error('Test Error'));

      await expect(service.removePropertyCode(1)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
