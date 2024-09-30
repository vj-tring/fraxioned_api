import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from 'src/main/service/logger.service';
import { User } from 'src/main/entities/user.entity';
import { PropertyCodeCategoryService } from 'src/main/service/property-code-category.service';
import { PropertyCodeCategory } from 'src/main/entities/property-code-category.entity';
import { PropertyCodes } from 'src/main/entities/property_codes.entity';
import { CreatePropertyCodeCategoryDto } from 'src/main/dto/requests/property-code-category/create-property-code-category.dto';
import { PROPERTY_CODE_CATEGORY_RESPONSES } from 'src/main/commons/constants/response-constants/property-code-category.constant';

describe('PropertyCodeCategoryService', () => {
  let service: PropertyCodeCategoryService;
  let propertyCodeCategoryRepository: Repository<PropertyCodeCategory>;
  let userRepository: Repository<User>;
  let propertyCodesRepository: Repository<PropertyCodes>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyCodeCategoryService,
        {
          provide: getRepositoryToken(PropertyCodeCategory),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PropertyCodes),
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

    service = module.get<PropertyCodeCategoryService>(
      PropertyCodeCategoryService,
    );
    propertyCodeCategoryRepository = module.get<
      Repository<PropertyCodeCategory>
    >(getRepositoryToken(PropertyCodeCategory));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    propertyCodesRepository = module.get<Repository<PropertyCodes>>(
      getRepositoryToken(PropertyCodes),
    );
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const createPropertyCodeCategoryDto: CreatePropertyCodeCategoryDto = {
    name: 'Test Property Code Category',
    createdBy: {
      id: 1,
    } as User,
  };

  const expectedPropertyCodeCategory: PropertyCodeCategory = {
    id: 1,
    name: 'Test Property Code Category',
    createdBy: { id: 1 } as User,
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    propertyCodes: [],
  };

  const user = { id: 1 } as User;

  describe('createPropertyCodeCategory', () => {
    it('should create a property code', async () => {
      const expectedResult =
        PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_CREATED(
          expectedPropertyCodeCategory,
        );
      jest
        .spyOn(propertyCodeCategoryRepository, 'findOne')
        .mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(propertyCodeCategoryRepository, 'create')
        .mockReturnValue(expectedPropertyCodeCategory);
      jest
        .spyOn(propertyCodeCategoryRepository, 'save')
        .mockResolvedValueOnce(expectedPropertyCodeCategory);

      expect(
        await service.createPropertyCodeCategory(createPropertyCodeCategoryDto),
      ).toEqual(expectedResult);
    });

    it('should return conflict if property code category already exists', async () => {
      jest
        .spyOn(propertyCodeCategoryRepository, 'findOne')
        .mockResolvedValueOnce(expectedPropertyCodeCategory);

      const expectedResult =
        PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_ALREADY_EXISTS(
          createPropertyCodeCategoryDto.name,
        );
      expect(
        await service.createPropertyCodeCategory(createPropertyCodeCategoryDto),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Error creating property code category: Property code category ${createPropertyCodeCategoryDto.name} already exists`,
      );
    });

    it('should return not found if user does not exist', async () => {
      jest
        .spyOn(propertyCodeCategoryRepository, 'findOne')
        .mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = PROPERTY_CODE_CATEGORY_RESPONSES.USER_NOT_FOUND(
        createPropertyCodeCategoryDto.createdBy.id,
      );

      expect(
        await service.createPropertyCodeCategory(createPropertyCodeCategoryDto),
      ).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${createPropertyCodeCategoryDto.createdBy.id} does not exist`,
      );
    });

    it('should handle errors during creation', async () => {
      jest
        .spyOn(propertyCodeCategoryRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        service.createPropertyCodeCategory(createPropertyCodeCategoryDto),
      ).rejects.toThrow(HttpException);
    });
  });
  describe('findAllPropertyCodeCategories', () => {
    it('should get all the property code categories', async () => {
      const expectedResult =
        PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORIES_FETCHED([
          expectedPropertyCodeCategory,
        ]);

      jest
        .spyOn(propertyCodeCategoryRepository, 'find')
        .mockResolvedValue([expectedPropertyCodeCategory]);

      expect(await service.findAllPropertyCodeCategories()).toEqual(
        expectedResult,
      );
    });

    it('should return no property code category if no property code category found', async () => {
      const expectedResult =
        PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORIES_NOT_FOUND();

      jest
        .spyOn(propertyCodeCategoryRepository, 'find')
        .mockResolvedValue([] as PropertyCodeCategory[]);

      expect(await service.findAllPropertyCodeCategories()).toEqual(
        expectedResult,
      );
    });

    it('should handle errors during retrieval of all property code categories', async () => {
      jest
        .spyOn(propertyCodeCategoryRepository, 'find')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.findAllPropertyCodeCategories()).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findPropertyCodeCategoryById', () => {
    it('should find property code by Id', async () => {
      const expectedResult =
        PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_FETCHED(
          expectedPropertyCodeCategory,
          expectedPropertyCodeCategory.id,
        );

      jest
        .spyOn(propertyCodeCategoryRepository, 'findOne')
        .mockResolvedValue(expectedPropertyCodeCategory);
      const id = 1;
      expect(await service.findPropertyCodeCategoryById(id)).toEqual(
        expectedResult,
      );
    });

    it('should return no property code category exists for the given id', async () => {
      jest
        .spyOn(propertyCodeCategoryRepository, 'findOne')
        .mockResolvedValueOnce(null);
      const id = 1;
      const expectedResult =
        PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_NOT_FOUND(id);

      expect(await service.findPropertyCodeCategoryById(id)).toEqual(
        expectedResult,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Property code category with ID ${id} not found`,
      );
    });

    it('should handle errors during retrieval of a property code category', async () => {
      jest
        .spyOn(propertyCodeCategoryRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));
      const id = 1;
      await expect(service.findPropertyCodeCategoryById(id)).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deletePropertyCodeCategoryById', () => {
    it('should log a message and return foreign key conflict response if property code category is mapped to a property code', async () => {
      const propertyCodeCategoryId = 1;
      const mockPropertyCode = new PropertyCodes();
      mockPropertyCode.id = propertyCodeCategoryId;

      jest
        .spyOn(propertyCodesRepository, 'findOne')
        .mockResolvedValue(mockPropertyCode);
      const loggerSpy = jest.spyOn(logger, 'log');
      const expectedResponse =
        PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_FOREIGN_KEY_CONFLICT(
          propertyCodeCategoryId,
        );

      const result = await service.deletePropertyCodeCategoryById(
        propertyCodeCategoryId,
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        `Property code category ID ${propertyCodeCategoryId} exists and is mapped to property code, hence cannot be deleted.`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should log a message and return property code category not found response if property code category is not found', async () => {
      jest.spyOn(propertyCodesRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(propertyCodeCategoryRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 0 });
      const loggerErrorSpy = jest.spyOn(logger, 'error');
      const expectedResponse =
        PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_NOT_FOUND(1);

      const result = await service.deletePropertyCodeCategoryById(1);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Property code category with ID ${1} not found`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should log a message and return success response if property code category is deleted successfully', async () => {
      jest.spyOn(propertyCodesRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(propertyCodeCategoryRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 1 });
      const loggerLogSpy = jest.spyOn(logger, 'log');
      const expectedResponse =
        PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_DELETED(1);

      const result = await service.deletePropertyCodeCategoryById(1);

      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Property code category with ID 1 deleted successfully`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw an HttpException if an error occurs during deletion of property code category', async () => {
      const error = new Error('An error occurred');

      jest.spyOn(propertyCodesRepository, 'findOne').mockRejectedValue(error);
      const loggerErrorSpy = jest.spyOn(logger, 'error');

      try {
        await service.deletePropertyCodeCategoryById(1);
      } catch (err) {
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          `Error deleting property code category with ID 1: ${error.message} - ${error.stack}`,
        );
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while deleting the Property Code Category',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
