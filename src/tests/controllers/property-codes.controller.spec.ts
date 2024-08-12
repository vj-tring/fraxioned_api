import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PropertyCodesController } from 'src/main/controller/property-codes.controller';
import { CreatePropertyCodeDto } from 'src/main/dto/requests/create-property-code.dto';
import { Property } from 'src/main/entities/property.entity';
import { PropertyCodes } from 'src/main/entities/property_codes.entity';
import { PropertyCodesService } from 'src/main/service/property-codes.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdatePropertyCodeDto } from 'src/main/dto/requests/update-property-code.dto';
import { AuthenticationService } from 'src/main/service/authentication.service';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';

describe('PropertyCodesController', () => {
  let controller: PropertyCodesController;
  let service: PropertyCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyCodesController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
        AuthGuard,
        PropertyCodesService,
        {
          provide: getRepositoryToken(PropertyCodes),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Property),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<PropertyCodesController>(PropertyCodesController);
    service = module.get<PropertyCodesService>(PropertyCodesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPropertyCodes', () => {
    it('should return a created property code', async () => {
      const mockRole = {
        id: 1,
        roleName: 'Admin',
        roleDescription: 'admin-role',
        createdBy: null,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      };

      const mockUser = {
        id: 1,
        firstName: 'admin',
        lastName: 'user',
        password: await bcrypt.hash('Admin@123', 10),
        imageURL: 'www.example.com/images',
        role: mockRole,
        isActive: true,
        addressLine1: 'address line 1',
        addressLine2: 'address line 2',
        state: 'test state',
        country: 'test country',
        city: 'test city',
        zipcode: '123456',
        resetToken: null,
        resetTokenExpires: new Date(Date.now()),
        lastLoginTime: new Date(Date.now()),
        createdBy: null,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        contactDetails: null,
      };

      const mockProperties = {
        id: 1,
        propertyName: 'test property',
        address: 'test address',
        city: 'test city',
        state: 'test state',
        country: 'test country',
        zipcode: 123456,
        houseDescription: 'test description',
        isExclusive: true,
        propertyShare: 1,
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      } as Property;

      const mockPropertyCodes = {
        id: 1,
        property: mockProperties,
        propertyCodeType: 'locker',
        propertyCode: '12345',
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      };

      const mockCreatePropertyCodeDto: CreatePropertyCodeDto = {
        property: mockProperties,
        propertyCodeType: 'locker',
        propertyCode: '12345',
        createdBy: mockUser,
      };

      jest
        .spyOn(service, 'createPropertyCodes')
        .mockResolvedValue(mockPropertyCodes);

      const result = await controller.createPropertyCodes(
        mockCreatePropertyCodeDto,
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyCodes);
      expect(service.createPropertyCodes).toHaveBeenCalled();
    });

    it('should throw Error when service throws NotFoundException', async () => {
      const mockRole = {
        id: 1,
        roleName: 'Admin',
        roleDescription: 'admin-role',
        createdBy: null,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      };

      const mockUser = {
        id: 1,
        firstName: 'admin',
        lastName: 'user',
        password: await bcrypt.hash('Admin@123', 10),
        imageURL: 'www.example.com/images',
        role: mockRole,
        isActive: true,
        addressLine1: 'address line 1',
        addressLine2: 'address line 2',
        state: 'test state',
        country: 'test country',
        city: 'test city',
        zipcode: '123456',
        resetToken: null,
        resetTokenExpires: new Date(Date.now()),
        lastLoginTime: new Date(Date.now()),
        createdBy: null,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        contactDetails: null,
      };

      const mockProperties = {
        id: 1,
        propertyName: 'test property',
        address: 'test address',
        city: 'test city',
        state: 'test state',
        country: 'test country',
        zipcode: 123456,
        houseDescription: 'test description',
        isExclusive: true,
        propertyShare: 1,
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      } as Property;

      const mockCreatePropertyCodeDto: CreatePropertyCodeDto = {
        property: mockProperties,
        propertyCodeType: 'locker',
        propertyCode: '12345',
        createdBy: mockUser,
      };

      jest
        .spyOn(service, 'createPropertyCodes')
        .mockRejectedValue(
          new NotFoundException(
            `Properties with ID ${mockCreatePropertyCodeDto.property.id} not found`,
          ),
        );

      await expect(
        controller.createPropertyCodes(mockCreatePropertyCodeDto),
      ).rejects.toThrow(
        new NotFoundException(
          `Properties with ID ${mockCreatePropertyCodeDto.property.id} not found`,
        ),
      );

      expect(service.createPropertyCodes).toHaveBeenCalled();
    });
  });

  describe('getAllPropertyCodes', () => {
    it('should return all the property codes', async () => {
      const mockPropertyCodes = [new PropertyCodes(), new PropertyCodes()];

      jest
        .spyOn(service, 'getAllPropertyCodes')
        .mockResolvedValue(mockPropertyCodes);

      const result = await controller.getAllPropertyCodes();

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyCodes);
      expect(service.getAllPropertyCodes).toHaveBeenCalled();
    });

    it('should throw Error when service throws NotFoundException', async () => {
      jest
        .spyOn(service, 'getAllPropertyCodes')
        .mockRejectedValue(new NotFoundException(`Property Codes not found`));

      await expect(controller.getAllPropertyCodes()).rejects.toThrow(
        new NotFoundException(`Property Codes not found`),
      );

      expect(service.getAllPropertyCodes).toHaveBeenCalled();
    });
  });

  describe('getPropertyCodesById', () => {
    it('should return a property detail of respective id', async () => {
      const mockPropertyCodes = new PropertyCodes();

      const mockPropertyCodesId = 1;

      jest
        .spyOn(service, 'getPropertyCodesById')
        .mockResolvedValue(mockPropertyCodes);

      const result = await controller.getPropertyCodesById(mockPropertyCodesId);

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyCodes);
      expect(service.getPropertyCodesById).toHaveBeenCalledWith(
        mockPropertyCodesId,
      );
    });

    it('should throw Error when service throws NotFoundException', async () => {
      const mockPropertyCodesId = 1;

      jest
        .spyOn(service, 'getPropertyCodesById')
        .mockRejectedValue(
          new NotFoundException(
            `Property Codes with ID ${mockPropertyCodesId} not found`,
          ),
        );

      await expect(
        controller.getPropertyCodesById(mockPropertyCodesId),
      ).rejects.toThrow(
        new NotFoundException(
          `Property Codes with ID ${mockPropertyCodesId} not found`,
        ),
      );

      expect(service.getPropertyCodesById).toHaveBeenCalled();
    });
  });

  describe('updatePropertyCodesById', () => {
    it('should return a updated property code of respective id', async () => {
      const mockPropertyCodes = new PropertyCodes();

      const mockRole = {
        id: 1,
        roleName: 'Admin',
        roleDescription: 'admin-role',
        createdBy: null,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      };

      const mockUser = {
        id: 1,
        firstName: 'admin',
        lastName: 'user',
        password: await bcrypt.hash('Admin@123', 10),
        imageURL: 'www.example.com/images',
        role: mockRole,
        isActive: true,
        addressLine1: 'address line 1',
        addressLine2: 'address line 2',
        state: 'test state',
        country: 'test country',
        city: 'test city',
        zipcode: '123456',
        resetToken: null,
        resetTokenExpires: new Date(Date.now()),
        lastLoginTime: new Date(Date.now()),
        createdBy: null,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        contactDetails: null,
      };

      const mockProperties = {
        id: 1,
        propertyName: 'test property',
        address: 'test address',
        city: 'test city',
        state: 'test state',
        country: 'test country',
        zipcode: 123456,
        houseDescription: 'test description',
        isExclusive: true,
        propertyShare: 1,
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      } as Property;

      const mockUpdatePropertyCodeDto: UpdatePropertyCodeDto = {
        property: mockProperties,
        propertyCodeType: 'locker',
        propertyCode: '12345',
        updatedBy: mockUser,
      };

      const mockPropertyCodesId = 1;

      jest
        .spyOn(service, 'updatePropertyCodesById')
        .mockResolvedValue(mockPropertyCodes);

      const result = await controller.updatePropertyCodesById(
        mockPropertyCodesId,
        mockUpdatePropertyCodeDto,
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyCodes);
      expect(service.updatePropertyCodesById).toHaveBeenCalledWith(
        mockPropertyCodesId,
        mockUpdatePropertyCodeDto,
      );
    });

    it('should throw Error when service throws NotFoundException', async () => {
      const mockRole = {
        id: 1,
        roleName: 'Admin',
        roleDescription: 'admin-role',
        createdBy: null,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      };

      const mockUser = {
        id: 1,
        firstName: 'admin',
        lastName: 'user',
        password: await bcrypt.hash('Admin@123', 10),
        imageURL: 'www.example.com/images',
        role: mockRole,
        isActive: true,
        addressLine1: 'address line 1',
        addressLine2: 'address line 2',
        state: 'test state',
        country: 'test country',
        city: 'test city',
        zipcode: '123456',
        resetToken: null,
        resetTokenExpires: new Date(Date.now()),
        lastLoginTime: new Date(Date.now()),
        createdBy: null,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        contactDetails: null,
      };

      const mockProperties = {
        id: 1,
        propertyName: 'test property',
        address: 'test address',
        city: 'test city',
        state: 'test state',
        country: 'test country',
        zipcode: 123456,
        houseDescription: 'test description',
        isExclusive: true,
        propertyShare: 1,
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      } as Property;

      const mockUpdatePropertyCodeDto: UpdatePropertyCodeDto = {
        property: mockProperties,
        propertyCodeType: 'locker',
        propertyCode: '12345',
        updatedBy: mockUser,
      };

      const mockPropertyCodesId = 1;

      jest
        .spyOn(service, 'updatePropertyCodesById')
        .mockRejectedValue(
          new NotFoundException(
            `Property Details with ID ${mockPropertyCodesId} not found`,
          ),
        );

      await expect(
        controller.updatePropertyCodesById(
          mockPropertyCodesId,
          mockUpdatePropertyCodeDto,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(service.updatePropertyCodesById).toHaveBeenCalled();
    });

    it('should throw Error when service throws BadRequestException', async () => {
      const mockRole = {
        id: 1,
        roleName: 'Admin',
        roleDescription: 'admin-role',
        createdBy: null,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      };

      const mockUser = {
        id: 1,
        firstName: 'admin',
        lastName: 'user',
        password: await bcrypt.hash('Admin@123', 10),
        imageURL: 'www.example.com/images',
        role: mockRole,
        isActive: true,
        addressLine1: 'address line 1',
        addressLine2: 'address line 2',
        state: 'test state',
        country: 'test country',
        city: 'test city',
        zipcode: '123456',
        resetToken: null,
        resetTokenExpires: new Date(Date.now()),
        lastLoginTime: new Date(Date.now()),
        createdBy: null,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        contactDetails: null,
      };

      const mockProperties = {
        id: 1,
        propertyName: 'test property',
        address: 'test address',
        city: 'test city',
        state: 'test state',
        country: 'test country',
        zipcode: 123456,
        houseDescription: 'test description',
        isExclusive: true,
        propertyShare: 1,
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      } as Property;

      const mockUpdatePropertyCodeDto: UpdatePropertyCodeDto = {
        property: mockProperties,
        propertyCodeType: 'locker',
        propertyCode: '12345',
        updatedBy: mockUser,
      };

      const mockPropertyCodesId = 1;

      jest
        .spyOn(service, 'updatePropertyCodesById')
        .mockRejectedValue(
          new BadRequestException('Property ID does not match'),
        );

      await expect(
        controller.updatePropertyCodesById(
          mockPropertyCodesId,
          mockUpdatePropertyCodeDto,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(service.updatePropertyCodesById).toHaveBeenCalled();
    });
  });

  describe('deletePropertyCodesById', () => {
    it('should returen a deleted property detail of respective id', async () => {
      const mockPropertyCodesId = 1;

      const mockPropertyCodes = new PropertyCodes();

      jest
        .spyOn(service, 'deletePropertyCodesById')
        .mockResolvedValue(mockPropertyCodes);

      const result =
        await controller.deletePropertyCodesById(mockPropertyCodesId);

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyCodes);
      expect(service.deletePropertyCodesById).toHaveBeenCalledWith(
        mockPropertyCodesId,
      );
    });

    it('should throw Error when service throws NotFoundException', async () => {
      const mockPropertyCodesId = 1;

      jest
        .spyOn(service, 'deletePropertyCodesById')
        .mockRejectedValue(
          new NotFoundException(
            `Property Details with ID ${mockPropertyCodesId} not found`,
          ),
        );

      await expect(
        controller.deletePropertyCodesById(mockPropertyCodesId),
      ).rejects.toThrow(
        new NotFoundException(
          `Property Details with ID ${mockPropertyCodesId} not found`,
        ),
      );

      expect(service.deletePropertyCodesById).toHaveBeenCalled();
    });
  });
});
