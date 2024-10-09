import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { PropertiesController } from 'src/main/controller/properties.controller';
import { CreatePropertiesDto } from 'src/main/dto/requests/property/create-property.dto';
import { UpdatePropertiesDto } from 'src/main/dto/requests/property/update-properties.dto';
import { PropertiesService } from 'src/main/service/properties.service';
import { User } from 'src/main/entities/user.entity';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';

describe('PropertiesController', () => {
  let controller: PropertiesController;

  const mockPropertiesService = {
    createProperties: jest.fn(),
    updatePropertiesById: jest.fn(),
    deletePropertiesById: jest.fn(),
    compareAndUpdateProperties: jest.fn(),
    getAllProperties: jest.fn(),
    getPropertiesById: jest.fn(),
    getPropertiesWithDetails: jest.fn(),
    getAllPropertiesWithDetailsByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [
        {
          provide: PropertiesService,
          useValue: mockPropertiesService,
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

    controller = module.get<PropertiesController>(PropertiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProperties', () => {
    it('should create properties', async () => {
      const createPropertiesDto: CreatePropertiesDto = {
        propertyName: 'Test Property',
        ownerRezPropId: 1,
        latitude: 12.34,
        longitude: 56.78,
        isActive: true,
        displayOrder: 1,
        createdBy: new User(),
      };
      const expectedResult = {
        id: 1,
        propertyName: 'Test Property',
        ownerRezPropId: 1,
        latitude: 12.34,
        longitude: 56.78,
        isActive: true,
        displayOrder: 1,
        createdBy: new User(),
      };
      mockPropertiesService.createProperties.mockResolvedValue(expectedResult);

      const result = await controller.createProperties(createPropertiesDto);

      expect(result).toBe(expectedResult);
      expect(mockPropertiesService.createProperties).toHaveBeenCalledWith(
        createPropertiesDto,
      );
    });

    it('should throw an error if service throws', async () => {
      const createPropertiesDto: CreatePropertiesDto = {
        propertyName: 'Test Property',
        ownerRezPropId: 1,
        latitude: 12.34,
        longitude: 56.78,
        isActive: true,
        displayOrder: 1,
        createdBy: new User(),
      };
      const error = new Error('Service error');
      mockPropertiesService.createProperties.mockRejectedValue(error);

      await expect(
        controller.createProperties(createPropertiesDto),
      ).rejects.toThrow(error);
    });
  });

  describe('deletePropertiesById', () => {
    it('should delete properties by id', async () => {
      const id = 1;
      const expectedResult = { success: true };
      mockPropertiesService.deletePropertiesById.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.deletePropertiesById(id);

      expect(result).toBe(expectedResult);
      expect(mockPropertiesService.deletePropertiesById).toHaveBeenCalledWith(
        id,
      );
    });

    it('should throw an error if service throws', async () => {
      const id = 1;
      const error = new Error('Service error');
      mockPropertiesService.deletePropertiesById.mockRejectedValue(error);

      await expect(controller.deletePropertiesById(id)).rejects.toThrow(error);
    });
  });

  describe('compareAndUpdateProperties', () => {
    it('should compare and update properties', async () => {
      const expectedResult = [{ id: 1, propertyName: 'Compared Property' }];
      mockPropertiesService.compareAndUpdateProperties.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.compareAndUpdateProperties();

      expect(result).toBe(expectedResult);
      expect(
        mockPropertiesService.compareAndUpdateProperties,
      ).toHaveBeenCalled();
    });

    it('should throw HttpException if service throws', async () => {
      const error = new Error('Service error');
      mockPropertiesService.compareAndUpdateProperties.mockRejectedValue(error);

      await expect(controller.compareAndUpdateProperties()).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getAllProperties', () => {
    it('should get all properties', async () => {
      const expectedResult = [{ id: 1, propertyName: 'Property 1' }];
      const mockReq = { headers: { 'user-id': '1' } } as unknown as Request;
      mockPropertiesService.getAllProperties.mockResolvedValue(expectedResult);

      const result = await controller.getAllProperties(mockReq);

      expect(result).toBe(expectedResult);
      expect(mockPropertiesService.getAllProperties).toHaveBeenCalledWith(1);
    });

    it('should throw an error if service throws', async () => {
      const mockReq = { headers: { 'user-id': '1' } } as unknown as Request;
      const error = new Error('Service error');
      mockPropertiesService.getAllProperties.mockRejectedValue(error);

      await expect(controller.getAllProperties(mockReq)).rejects.toThrow(error);
    });
  });

  describe('getPropertiesById', () => {
    it('should get properties by id', async () => {
      const id = 1;
      const expectedResult = { id: 1, propertyName: 'Property 1' };
      const mockReq = { headers: { 'user-id': '1' } } as unknown as Request;
      mockPropertiesService.getPropertiesById.mockResolvedValue(expectedResult);

      const result = await controller.getPropertiesById(id, mockReq);

      expect(result).toBe(expectedResult);
      expect(mockPropertiesService.getPropertiesById).toHaveBeenCalledWith(
        id,
        1,
      );
    });

    it('should throw an error if service throws', async () => {
      const id = 1;
      const mockReq = { headers: { 'user-id': '1' } } as unknown as Request;
      const error = new Error('Service error');
      mockPropertiesService.getPropertiesById.mockRejectedValue(error);

      await expect(controller.getPropertiesById(id, mockReq)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getPropertyWithDetailsById', () => {
    it('should get property with details by id', async () => {
      const id = 1;
      const expectedResult = {
        id: 1,
        propertyName: 'Property 1',
        details: 'Details',
      };
      const mockReq = { headers: { 'user-id': '1' } } as unknown as Request;
      mockPropertiesService.getPropertiesWithDetails.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getPropertyWithDetailsById(id, mockReq);

      expect(result).toBe(expectedResult);
      expect(
        mockPropertiesService.getPropertiesWithDetails,
      ).toHaveBeenCalledWith(id, 1);
    });

    it('should throw HttpException if service throws', async () => {
      const id = 1;
      const mockReq = { headers: { 'user-id': '1' } } as unknown as Request;
      const error = new Error('Service error');
      mockPropertiesService.getPropertiesWithDetails.mockRejectedValue(error);

      await expect(
        controller.getPropertyWithDetailsById(id, mockReq),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getAllPropertiesWithDetails', () => {
    it('should get all properties with details', async () => {
      const expectedResult = [
        { id: 1, propertyName: 'Property 1', details: 'Details' },
      ];
      const mockReq = { headers: { 'user-id': '1' } } as unknown as Request;
      mockPropertiesService.getPropertiesWithDetails.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getAllPropertiesWithDetails(mockReq);

      expect(result).toBe(expectedResult);
      expect(
        mockPropertiesService.getPropertiesWithDetails,
      ).toHaveBeenCalledWith(undefined, 1);
    });

    it('should throw HttpException if service throws', async () => {
      const mockReq = { headers: { 'user-id': '1' } } as unknown as Request;
      const error = new Error('Service error');
      mockPropertiesService.getPropertiesWithDetails.mockRejectedValue(error);

      await expect(
        controller.getAllPropertiesWithDetails(mockReq),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getAllPropertiesWithDetailsByUser', () => {
    it('should get all properties with details by user', async () => {
      const userId = 1;
      const expectedResult = [
        { id: 1, propertyName: 'Property 1', details: 'Details' },
      ];
      const mockReq = { headers: { 'user-id': 2 } } as unknown as Request;
      mockPropertiesService.getAllPropertiesWithDetailsByUser.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getAllPropertiesWithDetailsByUser(
        userId,
        mockReq,
      );

      expect(result).toBe(expectedResult);
      expect(
        mockPropertiesService.getAllPropertiesWithDetailsByUser,
      ).toHaveBeenCalledWith(userId, 2);
    });

    it('should throw HttpException if service throws', async () => {
      const userId = 1;
      const mockReq = { headers: { 'user-id': '2' } } as unknown as Request;
      const error = new Error('Service error');
      mockPropertiesService.getAllPropertiesWithDetailsByUser.mockRejectedValue(
        error,
      );

      await expect(
        controller.getAllPropertiesWithDetailsByUser(userId, mockReq),
      ).rejects.toThrow(HttpException);
    });
  });
});
