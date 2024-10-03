import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from 'src/main/entities/user.entity';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { PropertyCodesController } from 'src/main/controller/property-codes.controller';
import { PropertyCodesService } from 'src/main/service/property-codes.service';
import { CreatePropertyCodeDto } from 'src/main/dto/requests/property-code/create-property-code.dto';
import { UpdatePropertyCodeDto } from 'src/main/dto/requests/property-code/update-property-code.dto';
import { PropertyCodeCategory } from 'src/main/entities/property-code-category.entity';
import { Property } from 'src/main/entities/property.entity';
import { PropertyCodes } from 'src/main/entities/property_codes.entity';
import { PROPERTY_CODES_RESPONSES } from 'src/main/commons/constants/response-constants/property-codes.constant';

describe('PropertyCodesController', () => {
  let controller: PropertyCodesController;
  let service: PropertyCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyCodesController],
      providers: [
        {
          provide: PropertyCodesService,
          useValue: {
            createPropertyCodes: jest.fn(),
            findAllPropertyCodes: jest.fn(),
            findPropertyCodeById: jest.fn(),
            updatePropertyCodeById: jest.fn(),
            removePropertyCode: jest.fn(),
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
        AuthGuard,
      ],
    }).compile();

    controller = module.get<PropertyCodesController>(PropertyCodesController);
    service = module.get<PropertyCodesService>(PropertyCodesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

  describe('createPropertyCodes', () => {
    it('should create a property code', async () => {
      const expectedResult =
        PROPERTY_CODES_RESPONSES.PROPERTY_CODE_CREATED(expectedPropertyCode);
      jest
        .spyOn(service, 'createPropertyCodes')
        .mockResolvedValue(expectedResult);

      expect(
        await controller.createPropertyCodes(createPropertyCodeDto),
      ).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'createPropertyCodes').mockRejectedValue(error);

      try {
        await controller.createPropertyCodes(createPropertyCodeDto);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while creating the property code',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getAllPropertyCodes', () => {
    it('should get all property codes', async () => {
      const expectedResult = PROPERTY_CODES_RESPONSES.PROPERTY_CODES_FETCHED(
        [],
      );
      jest
        .spyOn(service, 'findAllPropertyCodes')
        .mockResolvedValue(expectedResult);

      expect(await controller.getAllPropertyCodes()).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'findAllPropertyCodes').mockRejectedValue(error);

      try {
        await controller.getAllPropertyCodes();
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving all the property codes',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
  describe('getPropertyCodeById', () => {
    it('should get property code by ID', async () => {
      const expectedResult = PROPERTY_CODES_RESPONSES.PROPERTY_CODE_FETCHED(
        expectedPropertyCode,
        expectedPropertyCode.id,
      );

      jest
        .spyOn(service, 'findPropertyCodeById')
        .mockResolvedValue(expectedResult);

      expect(await controller.getPropertyCodeById(1)).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      const id = 1;
      jest.spyOn(service, 'findPropertyCodeById').mockRejectedValue(error);

      try {
        await controller.getPropertyCodeById(id);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving the property code',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
  describe('updatePropertyCodeDetail', () => {
    it('should update property code details', async () => {
      const expectedResult = PROPERTY_CODES_RESPONSES.PROPERTY_CODE_UPDATED(
        expectedUpdatedPropertyCode,
        expectedUpdatedPropertyCode.id,
      );

      jest
        .spyOn(service, 'updatePropertyCodeById')
        .mockResolvedValue(expectedResult);

      expect(
        await controller.updatePropertyCodeDetail('1', updatePropertyCodeDto),
      ).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'updatePropertyCodeById').mockRejectedValue(error);

      try {
        await controller.updatePropertyCodeDetail(
          '1',
          {} as UpdatePropertyCodeDto,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while updating the property code',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
  describe('deletePropertyCodeById', () => {
    it('should delete property code by id', async () => {
      const deleteResult = {
        raw: {},
        affected: 1,
      };
      const expectedResult = PROPERTY_CODES_RESPONSES.PROPERTY_CODE_DELETED(
        deleteResult.affected,
      );

      jest
        .spyOn(service, 'removePropertyCode')
        .mockResolvedValue(expectedResult);

      expect(
        await controller.deletePropertyCodeById(deleteResult.affected),
      ).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'removePropertyCode').mockRejectedValue(error);

      try {
        await controller.deletePropertyCodeById(1);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while deleting the property code',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
