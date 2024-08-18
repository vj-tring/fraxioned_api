import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';
import { CreatePropertiesDto } from 'src/main/dto/requests/create-property.dto';
import { UpdatePropertiesDto } from 'src/main/dto/requests/update-properties.dto';
import { Property } from 'src/main/entities/property.entity';
import { PropertiesService } from 'src/main/service/properties.service';
import { User } from 'src/main/entities/user.entity';
import { PropertyDetails } from 'src/main/entities/property-details.entity';
import { USER_PROPERTY_RESPONSES } from 'src/main/commons/constants/response-constants/user-property.constant';
import { UserProperties } from 'src/main/entities/user-properties.entity';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PropertiesService', () => {
  let service: PropertiesService;
  let propertiesRepository: Repository<Property>;
  let propertyDetailsRepository: Repository<PropertyDetails>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(Property),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserProperties),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PropertyDetails),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    propertiesRepository = module.get<Repository<Property>>(
      getRepositoryToken(Property),
    );
    propertyDetailsRepository = module.get<Repository<PropertyDetails>>(
      getRepositoryToken(PropertyDetails),
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
        createdBy: mockUser,
        latitude: 0,
        longitude: 0,
        isActive: false,
        ownerRezPropId: 0,
        displayOrder: 0,
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
        createdBy: mockUser,
        latitude: 0,
        longitude: 0,
        isActive: false,
        ownerRezPropId: 0,
        displayOrder: 0,
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
        updatedBy: mockUser,
        latitude: 0,
        longitude: 0,
        isActive: false,
        ownerRezPropId: 0,
        displayOrder: 0,
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
        updatedBy: mockUser,
      } as Property;

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

  describe('compareAndUpdateProperties', () => {
    it('should compare and update properties', async () => {
      const mockExternalProperties = {
        items: [
          {
            id: 1,
            address: {
              street1: 'test address',
              city: 'test city',
              state: 'test state',
              country: 'test country',
              postal_code: '123456',
            },
            latitude: 0,
            longitude: 0,
            display_order: 0,
            active: true,
            bathrooms: 1,
            bathrooms_full: 1,
            bathrooms_half: 0,
            bedrooms: 1,
            max_guests: 1,
            max_pets: 1,
          },
        ],
      };

      const mockProperties = {
        id: 1,
        address: 'old address',
        city: 'old city',
        state: 'old state',
        country: 'old country',
        zipcode: '654321',
        latitude: 1,
        longitude: 1,
        displayOrder: 1,
        isActive: false,
      } as unknown as Property;

      const mockPropertyDetails = {
        id: 1,
        noOfBathrooms: 0,
        noOfBathroomsFull: 0,
        noOfBathroomsHalf: 0,
        noOfBedrooms: 0,
        noOfGuestsAllowed: 0,
        noOfPetsAllowed: 0,
      } as PropertyDetails;

      mockedAxios.get.mockResolvedValue({ data: mockExternalProperties });
      jest
        .spyOn(propertiesRepository, 'findOne')
        .mockResolvedValue(mockProperties);
      jest
        .spyOn(propertyDetailsRepository, 'findOne')
        .mockResolvedValue(mockPropertyDetails);
      jest
        .spyOn(propertiesRepository, 'save')
        .mockResolvedValue(mockProperties);
      jest
        .spyOn(propertyDetailsRepository, 'save')
        .mockResolvedValue(mockPropertyDetails);

      const result = await service.compareAndUpdateProperties();

      expect(result).toBeDefined();
      expect(result).toEqual([mockProperties]);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.ownerrez.com/v2/properties',
        {
          auth: {
            username: 'invoice@fraxioned.com',
            password: 'pt_82y3fsmphj7gc0kze0u0p16gp2yn6pap',
          },
        },
      );
      expect(propertiesRepository.findOne).toHaveBeenCalledWith({
        where: { ownerRezPropId: 1 },
      });
      expect(propertyDetailsRepository.findOne).toHaveBeenCalledWith({
        where: { property: { id: mockProperties.id } },
      });
      expect(propertiesRepository.save).toHaveBeenCalledWith(mockProperties);
      expect(propertyDetailsRepository.save).toHaveBeenCalledWith(
        mockPropertyDetails,
      );
    });

    it('should return an empty array if no properties are found', async () => {
      mockedAxios.get.mockResolvedValue({ data: { items: [] } });

      const result = await service.compareAndUpdateProperties();

      expect(result).toEqual([]);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.ownerrez.com/v2/properties',
        {
          auth: {
            username: 'invoice@fraxioned.com',
            password: 'pt_82y3fsmphj7gc0kze0u0p16gp2yn6pap',
          },
        },
      );
    });
  });

  describe('getPropertyWithDetailsById', () => {
    it('should return property with details', async () => {
      const mockProperty = {
        id: 1,
      } as Property;

      const mockPropertyDetails = {
        id: 1,
      } as PropertyDetails;

      jest
        .spyOn(propertiesRepository, 'findOne')
        .mockResolvedValue(mockProperty);
      jest
        .spyOn(propertyDetailsRepository, 'findOne')
        .mockResolvedValue(mockPropertyDetails);

      const result = await service.getPropertyWithDetailsById(1);

      expect(result).toBeDefined();
      expect(result).toEqual({
        propertyId: 1,
        propertyDetailsId: 1,
      });
      expect(propertiesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
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
      expect(propertyDetailsRepository.findOne).toHaveBeenCalledWith({
        where: { property: { id: 1 } },
      });
    });

    it('should return PROPERTY_NOT_FOUND if property is not found', async () => {
      jest.spyOn(propertiesRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getPropertyWithDetailsById(1);

      expect(result).toEqual(USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(1));
      expect(propertiesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
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

    it('should return PROPERTY_DETAIL_NOT_FOUND if property details are not found', async () => {
      const mockProperty = {
        id: 1,
        createdBy: { id: 1 },
        updatedBy: { id: 1 },
      } as Property;

      jest
        .spyOn(propertiesRepository, 'findOne')
        .mockResolvedValue(mockProperty);
      jest.spyOn(propertyDetailsRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getPropertyWithDetailsById(1);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.PROPERTY_DETAIL_NOT_FOUND(1),
      );
      expect(propertiesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
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
      expect(propertyDetailsRepository.findOne).toHaveBeenCalledWith({
        where: { property: { id: 1 } },
      });
    });
  });

  describe('getAllPropertiesWithDetails', () => {
    it('should return all properties with details', async () => {
      const mockProperty = {
        id: 1,
      } as Property;

      const mockPropertyDetails = {
        id: 1,
      } as PropertyDetails;

      jest
        .spyOn(propertiesRepository, 'find')
        .mockResolvedValue([mockProperty]);
      jest
        .spyOn(propertyDetailsRepository, 'findOne')
        .mockResolvedValue(mockPropertyDetails);

      const result = await service.getAllPropertiesWithDetails();

      expect(result).toBeDefined();
      expect(result).toEqual([
        {
          propertyId: 1,
          propertyDetailsId: 1,
        },
      ]);
      expect(propertiesRepository.find).toHaveBeenCalledWith();
      expect(propertyDetailsRepository.findOne).toHaveBeenCalledWith({
        where: { property: { id: 1 } },
      });
    });

    it('should return PROPERTIES_NOT_FOUND if no properties are found', async () => {
      jest.spyOn(propertiesRepository, 'find').mockResolvedValue([]);

      const result = await service.getAllPropertiesWithDetails();

      expect(result).toEqual(USER_PROPERTY_RESPONSES.PROPERTIES_NOT_FOUND);
      expect(propertiesRepository.find).toHaveBeenCalledWith();
    });

    it('should handle properties without details', async () => {
      const mockProperty = {
        id: 1,
      } as Property;

      jest
        .spyOn(propertiesRepository, 'find')
        .mockResolvedValue([mockProperty]);
      jest.spyOn(propertyDetailsRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getAllPropertiesWithDetails();

      expect(result).toBeDefined();
      expect(result).toEqual([
        {
          propertyId: 1,
          propertyDetailsId: null,
          ...mockProperty,
        },
      ]);
      expect(propertiesRepository.find).toHaveBeenCalledWith();
      expect(propertyDetailsRepository.findOne).toHaveBeenCalledWith({
        where: { property: { id: 1 } },
      });
    });
  });

  describe('PropertiesService - getAllPropertiesWithDetailsByUser', () => {
    let service: PropertiesService;
    let userPropertiesRepository: Repository<UserProperties>;
    let propertyDetailsRepository: Repository<PropertyDetails>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          PropertiesService,
          {
            provide: getRepositoryToken(Property),
            useClass: Repository,
          },
          {
            provide: getRepositoryToken(UserProperties),
            useClass: Repository,
          },
          {
            provide: getRepositoryToken(PropertyDetails),
            useClass: Repository,
          },
        ],
      }).compile();

      service = module.get<PropertiesService>(PropertiesService);
      userPropertiesRepository = module.get<Repository<UserProperties>>(
        getRepositoryToken(UserProperties),
      );
      propertyDetailsRepository = module.get<Repository<PropertyDetails>>(
        getRepositoryToken(PropertyDetails),
      );
    });

    it('should return user properties with details when found', async () => {
      const mockUserId = 1;
      const mockUserProperties = [
        {
          id: 1,
          property: { id: 1, propertyName: 'Property 1' },
          user: { id: mockUserId },
        } as UserProperties,
        {
          id: 2,
          property: { id: 2, propertyName: 'Property 2' },
          user: { id: mockUserId },
        } as UserProperties,
      ];
      const mockPropertyDetails = {
        id: 1,
        noOfBathrooms: 2,
        noOfBedrooms: 3,
      } as PropertyDetails;

      jest
        .spyOn(userPropertiesRepository, 'find')
        .mockResolvedValue(mockUserProperties);
      jest
        .spyOn(propertyDetailsRepository, 'findOne')
        .mockResolvedValue(mockPropertyDetails);

      const result =
        await service.getAllPropertiesWithDetailsByUser(mockUserId);

      expect(result).toEqual([
        {
          propertyId: 1,
          propertyDetailsId: 1,
          propertyName: 'Property 1',
          noOfBathrooms: 2,
          noOfBedrooms: 3,
          userProperties: [{ id: 1, user: { id: mockUserId } }],
        },
        {
          propertyId: 2,
          propertyDetailsId: 1,
          propertyName: 'Property 2',
          noOfBathrooms: 2,
          noOfBedrooms: 3,
          userProperties: [{ id: 2, user: { id: mockUserId } }],
        },
      ]);
      expect(userPropertiesRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUserId } },
        relations: ['property'],
      });
      expect(propertyDetailsRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should return USER_PROPERTY_NOT_FOUND when no user properties are found', async () => {
      const mockUserId = 1;
      jest.spyOn(userPropertiesRepository, 'find').mockResolvedValue([]);

      const result =
        await service.getAllPropertiesWithDetailsByUser(mockUserId);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTY_NOT_FOUND(mockUserId),
      );
      expect(userPropertiesRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUserId } },
        relations: ['property'],
      });
    });

    it('should handle properties without details', async () => {
      const mockUserId = 1;
      const mockUserProperties = [
        {
          id: 1,
          property: { id: 1, propertyName: 'Property 1' },
          user: { id: mockUserId },
        } as UserProperties,
      ];

      jest
        .spyOn(userPropertiesRepository, 'find')
        .mockResolvedValue(mockUserProperties);
      jest.spyOn(propertyDetailsRepository, 'findOne').mockResolvedValue(null);

      const result =
        await service.getAllPropertiesWithDetailsByUser(mockUserId);

      expect(result).toEqual([
        {
          propertyId: 1,
          propertyDetailsId: null,
          propertyName: 'Property 1',
          userProperties: [{ id: 1, user: { id: mockUserId } }],
        },
      ]);
    });

    it('should handle multiple user properties for the same property', async () => {
      const mockUserId = 1;
      const mockUserProperties = [
        {
          id: 1,
          property: { id: 1, propertyName: 'Property 1' },
          user: { id: mockUserId },
        } as UserProperties,
        {
          id: 2,
          property: { id: 1, propertyName: 'Property 1' },
          user: { id: mockUserId },
        } as UserProperties,
      ];
      const mockPropertyDetails = {
        id: 1,
        noOfBathrooms: 2,
        noOfBedrooms: 3,
      } as PropertyDetails;

      jest
        .spyOn(userPropertiesRepository, 'find')
        .mockResolvedValue(mockUserProperties);
      jest
        .spyOn(propertyDetailsRepository, 'findOne')
        .mockResolvedValue(mockPropertyDetails);

      const result =
        await service.getAllPropertiesWithDetailsByUser(mockUserId);

      expect(result).toEqual([
        {
          propertyId: 1,
          propertyDetailsId: 1,
          propertyName: 'Property 1',
          noOfBathrooms: 2,
          noOfBedrooms: 3,
          userProperties: [
            { id: 1, user: { id: mockUserId } },
            { id: 2, user: { id: mockUserId } },
          ],
        },
      ]);
    });

    it('should handle errors and throw them', async () => {
      const mockUserId = 1;
      const mockError = new Error('Database error');

      jest.spyOn(userPropertiesRepository, 'find').mockRejectedValue(mockError);

      await expect(
        service.getAllPropertiesWithDetailsByUser(mockUserId),
      ).rejects.toThrow(mockError);
    });
  });
});
