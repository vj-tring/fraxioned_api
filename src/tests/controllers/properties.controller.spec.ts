import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PropertiesController } from 'src/main/controller/properties.controller';
import { CreatePropertiesDto } from 'src/main/dto/requests/create-properties.dto';
import { Repository } from 'typeorm';
import { UpdatePropertiesDto } from 'src/main/dto/requests/update-properties.dto';
import { NotFoundException } from '@nestjs/common';
import { Properties } from 'src/main/entities/properties.entity';
import { PropertiesService } from 'src/main/service/properties.service';
import { AuthenticationService } from 'src/main/service/authentication.service';
import { User } from 'src/main/entities/user.entity';
import { UserContactDetails } from 'src/main/entities/user_contact_details.entity';
import { UserSession } from 'src/main/entities/user-session.entity';
import { UserProperties } from 'src/main/entities/user_properties.entity';
import { Role } from 'src/main/entities/role.entity';
import { MailService } from 'src/main/service/mail.service';
import { LoggerService } from 'src/main/service/logger.service';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';

describe('PropertiesController', () => {
  let controller: PropertiesController;
  let service: PropertiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(Properties),
          useClass: Repository,
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
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserContactDetails),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserSession),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserProperties),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
        {
          provide: MailService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<PropertiesController>(PropertiesController);
    service = module.get<PropertiesService>(PropertiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProperties', () => {
    it('should return a created property', async () => {
      const mockProperties = new Properties();

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
      };

      const mockCreatePropertiesDto: CreatePropertiesDto = {
        propertyName: 'test property',
        address: 'test address',
        city: 'test city',
        state: 'test state',
        country: 'test country',
        zipcode: 123456,
        houseDescription: 'test description',
        isExclusive: true,
        propertyShare: 1,
        mapCoordinates: 'POINT (0 0)',
        createdBy: mockUser,
      };

      jest.spyOn(service, 'createProperties').mockResolvedValue(mockProperties);

      const result = await controller.createProperties(mockCreatePropertiesDto);

      expect(result).toBeDefined();
      expect(result).toEqual(mockProperties);
      expect(service.createProperties).toHaveBeenCalled();
    });

    it('should throw Error when service throws Error', async () => {
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
      };

      const mockCreatePropertiesDto: CreatePropertiesDto = {
        propertyName: 'test property',
        address: 'test address',
        city: 'test city',
        state: 'test state',
        country: 'test country',
        zipcode: 123456,
        houseDescription: 'test description',
        isExclusive: true,
        propertyShare: 1,
        mapCoordinates: 'POINT (0 0)',
        createdBy: mockUser,
      };

      jest
        .spyOn(service, 'createProperties')
        .mockRejectedValue(new Error('Save Failed'));

      await expect(
        controller.createProperties(mockCreatePropertiesDto),
      ).rejects.toThrow(new Error('Save Failed'));

      expect(service.createProperties).toHaveBeenCalled();
    });
  });

  describe('getAllProperties', () => {
    it('should return all the properties', async () => {
      const mockProperties = [new Properties(), new Properties()];

      jest.spyOn(service, 'getAllProperties').mockResolvedValue(mockProperties);

      const result = await controller.getAllProperties();

      expect(result).toBeDefined();
      expect(result).toEqual(mockProperties);
      expect(service.getAllProperties).toHaveBeenCalled();
    });

    it('should throw Error when service throws NotFoundException', async () => {
      jest
        .spyOn(service, 'getAllProperties')
        .mockRejectedValue(new NotFoundException(`Properties not found`));

      await expect(controller.getAllProperties()).rejects.toThrow(
        new NotFoundException(`Properties not found`),
      );

      expect(service.getAllProperties).toHaveBeenCalled();
    });
  });

  describe('getPropertiesById', () => {
    it('should return a property of respective id', async () => {
      const mockProperties = new Properties();

      const mockPropertyId = 1;

      jest
        .spyOn(service, 'getPropertiesById')
        .mockResolvedValue(mockProperties);

      const result = await controller.getPropertiesById(mockPropertyId);

      expect(result).toBeDefined();
      expect(result).toEqual(mockProperties);
      expect(service.getPropertiesById).toHaveBeenCalledWith(mockPropertyId);
    });

    it('should throw Error when service throws NotFoundException', async () => {
      const mockPropertyId = 1;

      jest
        .spyOn(service, 'getPropertiesById')
        .mockRejectedValue(
          new NotFoundException(
            `Properties with ID ${mockPropertyId} not found`,
          ),
        );

      await expect(
        controller.getPropertiesById(mockPropertyId),
      ).rejects.toThrow(
        new NotFoundException(`Properties with ID ${mockPropertyId} not found`),
      );

      expect(service.getPropertiesById).toHaveBeenCalled();
    });
  });
  describe('updatePropertiesById', () => {
    it('should return a updated property of respective id', async () => {
      const mockProperties = new Properties();

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
      };

      const mockUpdatePropertiesDto: UpdatePropertiesDto = {
        propertyName: 'test property',
        address: 'test address',
        city: 'test city',
        state: 'test state',
        country: 'test country',
        zipcode: 123456,
        houseDescription: 'test description',
        isExclusive: true,
        propertyShare: 1,
        mapCoordinates: 'POINT (0 0)',
        updatedBy: mockUser,
      };

      const mockPropertyId = 1;

      jest
        .spyOn(service, 'updatePropertiesById')
        .mockResolvedValue(mockProperties);

      const result = await controller.updatePropertiesById(
        mockPropertyId,
        mockUpdatePropertiesDto,
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockProperties);
      expect(service.updatePropertiesById).toHaveBeenCalledWith(
        mockPropertyId,
        mockUpdatePropertiesDto,
      );
    });

    it('should throw Error when service throws NotFoundException', async () => {
      const mockPropertyId = 1;

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
      };

      const mockUpdatePropertiesDto: UpdatePropertiesDto = {
        propertyName: 'test property',
        address: 'test address',
        city: 'test city',
        state: 'test state',
        country: 'test country',
        zipcode: 123456,
        houseDescription: 'test description',
        isExclusive: true,
        propertyShare: 1,
        mapCoordinates: 'POINT (0 0)',
        updatedBy: mockUser,
      };

      jest
        .spyOn(service, 'updatePropertiesById')
        .mockRejectedValue(
          new NotFoundException(
            `Properties with ID ${mockPropertyId} not found`,
          ),
        );

      await expect(
        controller.updatePropertiesById(
          mockPropertyId,
          mockUpdatePropertiesDto,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(service.updatePropertiesById).toHaveBeenCalled();
    });
  });

  describe('deletePropertiesById', () => {
    it('should returen a deleted property of respective id', async () => {
      const mockPropertyId = 1;

      const mockProperties = new Properties();

      jest
        .spyOn(service, 'deletePropertiesById')
        .mockResolvedValue(mockProperties);

      const result = await controller.deletePropertiesById(mockPropertyId);

      expect(result).toBeDefined();
      expect(result).toEqual(mockProperties);
      expect(service.deletePropertiesById).toHaveBeenCalledWith(mockPropertyId);
    });

    it('should throw Error when service throws NotFoundException', async () => {
      const mockPropertyId = 1;

      jest
        .spyOn(service, 'deletePropertiesById')
        .mockRejectedValue(
          new NotFoundException(
            `Properties with ID ${mockPropertyId} not found`,
          ),
        );

      await expect(
        controller.deletePropertiesById(mockPropertyId),
      ).rejects.toThrow(
        new NotFoundException(`Properties with ID ${mockPropertyId} not found`),
      );

      expect(service.deletePropertiesById).toHaveBeenCalled();
    });
  });
});
