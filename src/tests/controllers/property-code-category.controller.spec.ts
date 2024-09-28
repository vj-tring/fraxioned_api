import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from 'src/main/service/logger.service';
import { User } from 'src/main/entities/user.entity';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { PropertyCodeCategoryController } from 'src/main/controller/property-code-category.controller';
import { PropertyCodeCategoryService } from 'src/main/service/property-code-category.service';
import { CreatePropertyCodeCategoryDto } from 'src/main/dto/requests/property-code-category/create-property-code-category.dto';
import { PropertyCodeCategory } from 'src/main/entities/property-code-category.entity';
import { PROPERTY_CODE_CATEGORY_RESPONSES } from 'src/main/commons/constants/response-constants/property-code-category.constant';

describe('PropertyCodeCategoryController', () => {
  let controller: PropertyCodeCategoryController;
  let service: PropertyCodeCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyCodeCategoryController],
      providers: [
        {
          provide: PropertyCodeCategoryService,
          useValue: {
            createPropertyCodeCategory: jest.fn(),
            findAllPropertyCodeCategories: jest.fn(),
            findPropertyCodeCategoryById: jest.fn(),
            deletePropertyCodeCategoryById: jest.fn(),
          },
        },
        {
          provide: AuthenticationService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<PropertyCodeCategoryController>(
      PropertyCodeCategoryController,
    );
    service = module.get<PropertyCodeCategoryService>(
      PropertyCodeCategoryService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

  describe('createPropertyCodeCategory', () => {
    it('should create a property code category', async () => {
      const expectedResult =
        PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_CREATED(
          expectedPropertyCodeCategory,
        );
      jest
        .spyOn(service, 'createPropertyCodeCategory')
        .mockResolvedValue(expectedResult);

      expect(
        await controller.createPropertyCodeCategory(
          createPropertyCodeCategoryDto,
        ),
      ).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest
        .spyOn(service, 'createPropertyCodeCategory')
        .mockRejectedValue(error);

      try {
        await controller.createPropertyCodeCategory(
          createPropertyCodeCategoryDto,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while creating the Property Code Category',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getAllPropertyCodeCategories', () => {
    it('should get all the property code categories', async () => {
      const expectedResult =
        PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORIES_FETCHED([]);
      jest
        .spyOn(service, 'findAllPropertyCodeCategories')
        .mockResolvedValue(expectedResult);

      expect(await controller.getAllPropertyCodeCategories()).toEqual(
        expectedResult,
      );
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest
        .spyOn(service, 'findAllPropertyCodeCategories')
        .mockRejectedValue(error);

      try {
        await controller.getAllPropertyCodeCategories();
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving all Property Code Categories',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getPropertyCodeCategoryById', () => {
    it('should get property code category by ID', async () => {
      const expectedResult =
        PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_FETCHED(
          expectedPropertyCodeCategory,
          expectedPropertyCodeCategory.id,
        );

      const id = 1;
      jest
        .spyOn(service, 'findPropertyCodeCategoryById')
        .mockResolvedValue(expectedResult);

      expect(await controller.getPropertyCodeCategoryById(id)).toEqual(
        expectedResult,
      );
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      const id = 1;
      jest
        .spyOn(service, 'findPropertyCodeCategoryById')
        .mockRejectedValue(error);

      try {
        await controller.getPropertyCodeCategoryById(id);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving the Property Code Category',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
  describe('deletePropertyCodeCategory', () => {
    it('should delete property code category by id', async () => {
      const deleteResult = {
        raw: {},
        affected: 1,
      };
      const expectedResult =
        PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_DELETED(
          deleteResult.affected,
        );

      jest
        .spyOn(service, 'deletePropertyCodeCategoryById')
        .mockResolvedValue(expectedResult);

      expect(await controller.deletePropertyCodeCategory(1)).toEqual(
        expectedResult,
      );
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest
        .spyOn(service, 'deletePropertyCodeCategoryById')
        .mockRejectedValue(error);

      try {
        await controller.deletePropertyCodeCategory(1);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while deleting the Property Code Category',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
