import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
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

describe('PropertyCodesService', () => {
  let service: PropertyCodesService;
  let propertiesRepository: Repository<Property>;
  let propertyCodesRepository: Repository<PropertyCodes>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyCodesService,
        {
          provide: AuthenticationService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
        AuthGuard,
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

    service = module.get<PropertyCodesService>(PropertyCodesService);
    propertiesRepository = module.get<Repository<Property>>(
      getRepositoryToken(Property),
    );
    propertyCodesRepository = module.get<Repository<PropertyCodes>>(
      getRepositoryToken(PropertyCodes),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPropertyCodes', () => {
    it('should create and return a new property code', async () => {
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
        .spyOn(propertiesRepository, 'findOne')
        .mockResolvedValue(mockProperties);
      jest
        .spyOn(propertyCodesRepository, 'create')
        .mockReturnValue(mockPropertyCodes);
      jest
        .spyOn(propertyCodesRepository, 'save')
        .mockResolvedValue(mockPropertyCodes);

      const result = await service.createPropertyCodes(
        mockCreatePropertyCodeDto,
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyCodes);
      expect(propertiesRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCreatePropertyCodeDto.property as unknown as number },
      });
      expect(propertyCodesRepository.create).toHaveBeenCalledWith(
        mockCreatePropertyCodeDto,
      );
      expect(propertyCodesRepository.save).toHaveBeenCalledWith(
        mockPropertyCodes,
      );
    });

    it('should return NotFoundException if no properties found', async () => {
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

      jest.spyOn(propertiesRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.createPropertyCodes(mockCreatePropertyCodeDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllPropertyCodes', () => {
    it('should return all the property codes', async () => {
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

      const mockPropertyCodes = [
        {
          id: 1,
          property: mockProperties,
          propertyCodeType: 'locker',
          propertyCode: '12345',
          createdBy: mockUser,
          updatedBy: null,
          createdAt: new Date(Date.now()),
          updatedAt: null,
        } as PropertyCodes,
      ];

      jest
        .spyOn(propertyCodesRepository, 'find')
        .mockResolvedValue(mockPropertyCodes);

      const result = await service.getAllPropertyCodes();

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyCodes);
      expect(propertyCodesRepository.find).toHaveBeenCalledWith({
        relations: ['property', 'createdBy', 'updatedBy'],
        select: {
          property: {
            id: true,
          },
          createdBy: {
            id: true,
          },
          updatedBy: {
            id: true,
          },
        },
      });
    });

    it('should return NotFoundException if no property codes found', async () => {
      jest.spyOn(propertyCodesRepository, 'find').mockResolvedValue(null);

      await expect(service.getAllPropertyCodes()).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPropertyCodesById', () => {
    it('should return a respective property code', async () => {
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
      } as PropertyCodes;

      const mockPropertyCodesId = 1;

      jest
        .spyOn(propertyCodesRepository, 'findOne')
        .mockResolvedValue(mockPropertyCodes);

      const result = await service.getPropertyCodesById(mockPropertyCodesId);

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyCodes);
      expect(propertyCodesRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPropertyCodesId },
        relations: ['property', 'createdBy', 'updatedBy'],
        select: {
          property: {
            id: true,
          },
          createdBy: {
            id: true,
          },
          updatedBy: {
            id: true,
          },
        },
      });
    });

    it('should return NotFoundException if no property codes found', async () => {
      const mockPropertyCodesId = 1;

      jest.spyOn(propertyCodesRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.getPropertyCodesById(mockPropertyCodesId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePropertyCodesById', () => {
    it('should update and return a new property code', async () => {
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
      } as PropertyCodes;

      const mockUpdatePropertyCodeDto: UpdatePropertyCodeDto = {
        property: mockProperties,
        propertyCodeType: 'locker',
        propertyCode: '12345',
        updatedBy: mockUser,
      };

      const mockPropertyCodesId = 1;

      jest
        .spyOn(propertyCodesRepository, 'findOne')
        .mockResolvedValue(mockPropertyCodes);
      jest.spyOn(propertyCodesRepository, 'merge').mockReturnValue({
        ...mockPropertyCodes,
        ...mockUpdatePropertyCodeDto,
      });
      jest.spyOn(propertyCodesRepository, 'save').mockResolvedValue(null);

      const result = await service.updatePropertyCodesById(
        mockPropertyCodesId,
        mockUpdatePropertyCodeDto,
      );

      expect(result).toBeDefined();
      expect(result).toEqual({
        ...mockPropertyCodes,
        ...mockUpdatePropertyCodeDto,
      });
      expect(propertyCodesRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPropertyCodesId },
        relations: ['createdBy', 'property', 'updatedBy'],
      });
      expect(propertyCodesRepository.merge).toHaveBeenCalledWith(
        mockPropertyCodes,
        mockUpdatePropertyCodeDto,
      );
      expect(propertyCodesRepository.save).toHaveBeenCalled();
    });

    it('should return NotFoundException if no property codes found', async () => {
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

      jest.spyOn(propertyCodesRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updatePropertyCodesById(
          mockPropertyCodesId,
          mockUpdatePropertyCodeDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return BadRequestException if no property codes found', async () => {
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
        property: new Property(),
        propertyCodeType: 'locker',
        propertyCode: '12345',
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      } as PropertyCodes;

      const mockUpdatePropertyCodeDto: UpdatePropertyCodeDto = {
        property: mockProperties,
        propertyCodeType: 'locker',
        propertyCode: '12345',
        updatedBy: mockUser,
      };

      const mockPropertyCodesId = 1;

      jest
        .spyOn(propertyCodesRepository, 'findOne')
        .mockResolvedValue(mockPropertyCodes);

      await expect(
        service.updatePropertyCodesById(
          mockPropertyCodesId,
          mockUpdatePropertyCodeDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deletePropertyCodesById', () => {
    it('should delete the property code and return the result', async () => {
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

      const mockPropertyCodes = {
        id: 1,
        property: new Property(),
        propertyCodeType: 'locker',
        propertyCode: '12345',
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      } as PropertyCodes;

      const mockPropertyCodesId = 1;

      jest
        .spyOn(propertyCodesRepository, 'findOne')
        .mockResolvedValue(mockPropertyCodes);
      jest
        .spyOn(propertyCodesRepository, 'remove')
        .mockResolvedValue(mockPropertyCodes);

      const result = await service.deletePropertyCodesById(mockPropertyCodesId);

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyCodes);
      expect(propertyCodesRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPropertyCodesId },
      });
      expect(propertyCodesRepository.remove).toHaveBeenCalledWith(
        mockPropertyCodes,
      );
    });

    it('should return NotFoundException if no property codes found', async () => {
      const mockPropertyCodesId = 1;

      jest.spyOn(propertyCodesRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.deletePropertyCodesById(mockPropertyCodesId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
