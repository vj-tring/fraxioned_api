import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';
import { CreatePropertiesDto } from 'src/main/dto/requests/create-property.dto';
import { UpdatePropertiesDto } from 'src/main/dto/requests/update-properties.dto';
import { Property } from 'src/main/entities/Property.entity';
import { PropertiesService } from 'src/main/service/properties.service';
import { User } from 'src/main/entities/user.entity';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let propertiesRepository: Repository<Property>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(Property),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    propertiesRepository = module.get<Repository<Property>>(
      getRepositoryToken(Property),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProperties', () => {
    it('should create and return a new property', async () => {
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
      } as User;

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
        mapCoordinates: 'POINT (0 0)',
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      } as Property;

      jest
        .spyOn(propertiesRepository, 'create')
        .mockReturnValue(mockProperties);
      jest
        .spyOn(propertiesRepository, 'save')
        .mockResolvedValue(mockProperties);

      const result = await service.createProperties(mockCreatePropertiesDto);

      expect(result).toBeDefined();
      expect(result).toEqual(mockProperties);
      expect(propertiesRepository.create).toHaveBeenCalledWith(
        mockCreatePropertiesDto,
      );
      expect(propertiesRepository.save).toHaveBeenCalledWith(mockProperties);
    });

    it('should return Error if save fails', async () => {
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
      } as User;

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
        mapCoordinates: 'POINT (0 0)',
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      } as Property;

      jest
        .spyOn(propertiesRepository, 'create')
        .mockReturnValue(mockProperties);
      jest
        .spyOn(propertiesRepository, 'save')
        .mockRejectedValue(new Error('Save Failed'));

      await expect(
        service.createProperties(mockCreatePropertiesDto),
      ).rejects.toThrow(new Error('Save Failed'));
    });
  });

  describe('getAllProperties', () => {
    it('should return all the properties', async () => {
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

      const mockProperties = [
        {
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
          mapCoordinates: 'POINT (0 0)',
          createdBy: mockUser,
          updatedBy: null,
          createdAt: new Date(Date.now()),
          updatedAt: null,
        } as Property,
      ];

      jest
        .spyOn(propertiesRepository, 'find')
        .mockResolvedValue(mockProperties);

      const result = await service.getAllProperties();

      expect(result).toBeDefined();
      expect(result).toEqual(mockProperties);
      expect(propertiesRepository.find).toHaveBeenCalledWith({
        relations: ['createdBy', 'updatedBy'],
        select: {
          createdBy: {
            id: true,
          },
          updatedBy: {
            id: true,
          },
        },
      });
    });

    it('should return NotFoundException if no properties found', async () => {
      jest.spyOn(propertiesRepository, 'find').mockResolvedValue([]);

      await expect(service.getAllProperties()).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPropertiesById', () => {
    it('should return a respective property', async () => {
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
        mapCoordinates: 'POINT (0 0)',
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      } as Property;

      const mockPropertyId = 1;

      jest
        .spyOn(propertiesRepository, 'findOne')
        .mockResolvedValue(mockProperties);

      const result = await service.getPropertiesById(mockPropertyId);

      expect(result).toBeDefined();
      expect(result).toEqual(mockProperties);
      expect(propertiesRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPropertyId },
        relations: ['createdBy', 'updatedBy'],
        select: {
          createdBy: {
            id: true,
          },
          updatedBy: {
            id: true,
          },
        },
      });
    });

    it('should return NotFoundException if no properties found', async () => {
      const mockPropertyId = 1;

      jest.spyOn(propertiesRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getPropertiesById(mockPropertyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePropertiesById', () => {
    it('should update and return a new property', async () => {
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
      } as User;

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
        mapCoordinates: 'POINT (0 0)',
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      };

      const mockPropertyId = 1;

      jest
        .spyOn(propertiesRepository, 'findOne')
        .mockResolvedValue(mockProperties);
      jest
        .spyOn(propertiesRepository, 'merge')
        .mockReturnValue({ ...mockProperties, ...mockUpdatePropertiesDto });
      jest.spyOn(propertiesRepository, 'save').mockResolvedValue(null);

      const result = await service.updatePropertiesById(
        mockPropertyId,
        mockUpdatePropertiesDto,
      );

      expect(result).toBeDefined();
      expect(result).toEqual({ ...mockProperties, ...mockUpdatePropertiesDto });
      expect(propertiesRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPropertyId },
      });
      expect(propertiesRepository.merge).toHaveBeenCalledWith(
        mockProperties,
        mockUpdatePropertiesDto,
      );
      expect(propertiesRepository.save).toHaveBeenCalled();
    });

    it('should return NotFoundException if no properties found', async () => {
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
      } as User;

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

      jest.spyOn(propertiesRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updatePropertiesById(mockPropertyId, mockUpdatePropertiesDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePropertiesById', () => {
    it('should delete the property and return the result', async () => {
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
        mapCoordinates: 'POINT (0 0)',
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      } as Property;

      const mockPropertyId = 1;

      jest
        .spyOn(propertiesRepository, 'findOne')
        .mockResolvedValue(mockProperties);

      jest
        .spyOn(propertiesRepository, 'remove')
        .mockResolvedValue(mockProperties);

      const result = await service.deletePropertiesById(mockPropertyId);

      expect(result).toBeDefined();
      expect(result).toEqual(mockProperties);
      expect(propertiesRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPropertyId },
      });
      expect(propertiesRepository.remove).toHaveBeenCalledWith(mockProperties);
    });

    it('should return NotFoundException if no properties found', async () => {
      const mockPropertyId = 1;

      jest.spyOn(propertiesRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.deletePropertiesById(mockPropertyId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
