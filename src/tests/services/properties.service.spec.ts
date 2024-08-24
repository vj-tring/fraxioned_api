import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';
import { Property } from 'src/main/entities/property.entity';
import { PropertiesService } from 'src/main/service/properties.service';
import { User } from 'src/main/entities/user.entity';
import { PropertyDetails } from 'src/main/entities/property-details.entity';
import { USER_PROPERTY_RESPONSES } from 'src/main/commons/constants/response-constants/user-property.constant';
import { UserProperties } from 'src/main/entities/user-properties.entity';
import axios from 'axios';
import { CreatePropertiesDto } from 'src/main/dto/requests/property/create-property.dto';
import { UpdatePropertiesDto } from 'src/main/dto/requests/property/update-properties.dto';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PropertiesService', () => {
  let service: PropertiesService;
  let propertiesRepository: Repository<Property>;
  let propertyDetailsRepository: Repository<PropertyDetails>;
  let userPropertiesRepository: Repository<UserProperties>;

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
    userPropertiesRepository = module.get<Repository<UserProperties>>(
      getRepositoryToken(UserProperties),
    );

    // Mock the repository methods
    jest.spyOn(userPropertiesRepository, 'find').mockImplementation();
    jest.spyOn(propertyDetailsRepository, 'findOne').mockImplementation();
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

  describe('getPropertiesWithDetails', () => {
    it('should return PROPERTY_NOT_FOUND when property is not found', async () => {
      jest.spyOn(propertiesRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getPropertiesWithDetails(1);

      expect(result).toEqual(USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(1));
    });

    it('should return PROPERTY_DETAIL_NOT_FOUND when property details are not found', async () => {
      const mockProperty = { id: 1, propertyName: 'Test Property' } as Property;

      jest
        .spyOn(propertiesRepository, 'findOne')
        .mockResolvedValue(mockProperty);
      jest.spyOn(propertyDetailsRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getPropertiesWithDetails(1);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.PROPERTY_DETAIL_NOT_FOUND(1),
      );
    });

    it('should return PROPERTIES_NOT_FOUND when no properties are found', async () => {
      jest.spyOn(propertiesRepository, 'find').mockResolvedValue([]);

      const result = await service.getPropertiesWithDetails();

      expect(result).toEqual(USER_PROPERTY_RESPONSES.PROPERTIES_NOT_FOUND);
    });

    it('should handle errors and throw them', async () => {
      const mockError = new Error('Database error');
      jest.spyOn(propertiesRepository, 'findOne').mockRejectedValue(mockError);

      await expect(service.getPropertiesWithDetails(1)).rejects.toThrow(
        mockError,
      );
    });
  });

  describe('getAllPropertiesWithDetailsByUser', () => {
    const userId = 1;

    it('should return user properties with details successfully', async () => {
      const mockUserProperties = [
        {
          property: { id: 1, propertyName: 'Test Property' },
          user: { id: userId },
        },
      ];
      const mockPropertyDetails = {
        id: 1,
        property: { id: 1 },
        propertyDetailsName: 'Test Property Details',
      };

      (userPropertiesRepository.find as jest.Mock).mockResolvedValue(
        mockUserProperties,
      );
      (propertyDetailsRepository.findOne as jest.Mock).mockResolvedValue(
        mockPropertyDetails,
      );

      const result = await service.getAllPropertiesWithDetailsByUser(userId);

      expect(result).toBeDefined();
      expect(result).toEqual([
        {
          propertyId: 1,
          propertyDetailsId: 1,
          propertyName: 'Test Property',
          propertyDetailsName: 'Test Property Details',
          userProperties: [
            {
              user: { id: userId },
            },
          ],
          property: {
            id: 1,
          },
        },
      ]);
      expect(userPropertiesRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['property', 'user'],
      });
      expect(propertyDetailsRepository.findOne).toHaveBeenCalledWith({
        where: { property: { id: 1 } },
      });
    });

    it('should return USER_PROPERTY_NOT_FOUND when no user properties are found', async () => {
      (userPropertiesRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.getAllPropertiesWithDetailsByUser(userId);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTY_NOT_FOUND(userId),
      );
      expect(userPropertiesRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['property', 'user'],
      });
    });

    it('should handle property details not found', async () => {
      const mockUserProperties = [
        {
          property: { id: 1, propertyName: 'Test Property' },
          user: { id: userId },
        },
      ];

      (userPropertiesRepository.find as jest.Mock).mockResolvedValue(
        mockUserProperties,
      );
      (propertyDetailsRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.getAllPropertiesWithDetailsByUser(userId);

      expect(result).toEqual([
        {
          propertyId: 1,
          propertyDetailsId: null,
          propertyName: 'Test Property',
          userProperties: [
            {
              user: { id: userId },
            },
          ],
        },
      ]);
      expect(userPropertiesRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['property', 'user'],
      });
      expect(propertyDetailsRepository.findOne).toHaveBeenCalledWith({
        where: { property: { id: 1 } },
      });
    });

    it('should handle errors and throw them', async () => {
      const mockError = new Error('Database error');
      (userPropertiesRepository.find as jest.Mock).mockRejectedValue(mockError);

      await expect(
        service.getAllPropertiesWithDetailsByUser(userId),
      ).rejects.toThrow(mockError);
      expect(userPropertiesRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['property', 'user'],
      });
    });
  });
});
