import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PropertyDetailsController } from 'src/main/controller/property-details.controller';
import { CreatePropertyDetailsDto } from 'src/main/dto/requests/create-property-details.dto';
import { Property } from 'src/main/entities/property.entity';
import { PropertyDetails } from 'src/main/entities/property-details.entity';
import { PropertyDetailsService } from 'src/main/service/property-details.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdatePropertyDetailsDto } from 'src/main/dto/requests/update-property-details.dto';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { AuthenticationService } from 'src/main/service/authentication.service';

describe('PropertyDetailsController', () => {
  let controller: PropertyDetailsController;
  let service: PropertyDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyDetailsController],
      providers: [
        PropertyDetailsService,
        {
          provide: getRepositoryToken(PropertyDetails),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Property),
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
        AuthGuard,
      ],
    }).compile();

    controller = module.get<PropertyDetailsController>(
      PropertyDetailsController,
    );
    service = module.get<PropertyDetailsService>(PropertyDetailsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPropertyDetails', () => {
    it('should return a created property detail', async () => {
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
        mapCoordinates: 'POINT (0 0)',
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      };

      const mockPropertyDetails = {
        id: 1,
        property: mockProperties,
        noOfGuestsAllowed: 1,
        noOfBedrooms: 1,
        noOfBathrooms: 1,
        squareFootage: '100 x 100',
        checkInTime: 4,
        checkOutTime: 11,
        cleaningFee: 100,
        noOfPetsAllowed: 2,
        petPolicy: 'allowed',
        feePerPet: 100,
        peakSeasonStartDate: null,
        peakSeasonEndDate: null,
        peakSeasonAllottedNights: 2,
        offSeasonAllottedNights: 2,
        peakSeasonAllottedHolidayNights: 2,
        offSeasonAllottedHolidayNights: 2,
        lastMinuteBookingAllottedNights: 2,
        wifiNetwork: 'we23456',
        createdBy: null,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      };

      const mockCreatePropertyDetailsDto: CreatePropertyDetailsDto = {
        property: mockProperties,
        noOfGuestsAllowed: 1,
        noOfBedrooms: 1,
        noOfBathrooms: 1,
        squareFootage: '100 x 100',
        checkInTime: 4,
        checkOutTime: 11,
        cleaningFee: 100,
        noOfPetsAllowed: 2,
        petPolicy: 'allowed',
        feePerPet: 100,
        peakSeasonStartDate: null,
        peakSeasonEndDate: null,
        peakSeasonAllottedNights: 2,
        offSeasonAllottedNights: 2,
        peakSeasonAllottedHolidayNights: 2,
        offSeasonAllottedHolidayNights: 2,
        lastMinuteBookingAllottedNights: 2,
        wifiNetwork: 'we23456',
        createdBy: mockUser,
      };

      jest
        .spyOn(service, 'createPropertyDetails')
        .mockResolvedValue(mockPropertyDetails);

      const result = await controller.createPropertyDetails(
        mockCreatePropertyDetailsDto,
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyDetails);
      expect(service.createPropertyDetails).toHaveBeenCalled();
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
        mapCoordinates: 'POINT (0 0)',
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      };

      const mockCreatePropertyDetailsDto: CreatePropertyDetailsDto = {
        property: mockProperties,
        noOfGuestsAllowed: 1,
        noOfBedrooms: 1,
        noOfBathrooms: 1,
        squareFootage: '100 x 100',
        checkInTime: 4,
        checkOutTime: 11,
        cleaningFee: 100,
        noOfPetsAllowed: 2,
        petPolicy: 'allowed',
        feePerPet: 100,
        peakSeasonStartDate: null,
        peakSeasonEndDate: null,
        peakSeasonAllottedNights: 2,
        offSeasonAllottedNights: 2,
        peakSeasonAllottedHolidayNights: 2,
        offSeasonAllottedHolidayNights: 2,
        lastMinuteBookingAllottedNights: 2,
        wifiNetwork: 'we23456',
        createdBy: mockUser,
      };

      jest
        .spyOn(service, 'createPropertyDetails')
        .mockRejectedValue(
          new NotFoundException(
            `Properties with ID ${mockCreatePropertyDetailsDto.property.id} not found`,
          ),
        );

      await expect(
        controller.createPropertyDetails(mockCreatePropertyDetailsDto),
      ).rejects.toThrow(
        new NotFoundException(
          `Properties with ID ${mockCreatePropertyDetailsDto.property.id} not found`,
        ),
      );

      expect(service.createPropertyDetails).toHaveBeenCalled();
    });
  });

  describe('getAllPropertyDetails', () => {
    it('should return all the property details', async () => {
      const mockPropertyDetails = [
        new PropertyDetails(),
        new PropertyDetails(),
      ];

      jest
        .spyOn(service, 'getAllPropertyDetails')
        .mockResolvedValue(mockPropertyDetails);

      const result = await controller.getAllPropertyDetails();

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyDetails);
      expect(service.getAllPropertyDetails).toHaveBeenCalled();
    });

    it('should throw Error when service throws NotFoundException', async () => {
      jest
        .spyOn(service, 'getAllPropertyDetails')
        .mockRejectedValue(new NotFoundException(`Property Details not found`));

      await expect(controller.getAllPropertyDetails()).rejects.toThrow(
        new NotFoundException(`Property Details not found`),
      );

      expect(service.getAllPropertyDetails).toHaveBeenCalled();
    });
  });

  describe('getPropertyDetailsById', () => {
    it('should return a property detail of respective id', async () => {
      const mockPropertyDetails = new PropertyDetails();

      const mockPropertyDetailsId = 1;

      jest
        .spyOn(service, 'getPropertyDetailsById')
        .mockResolvedValue(mockPropertyDetails);

      const result = await controller.getPropertyDetailsById(
        mockPropertyDetailsId,
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyDetails);
      expect(service.getPropertyDetailsById).toHaveBeenCalledWith(
        mockPropertyDetailsId,
      );
    });

    it('should throw Error when service throws NotFoundException', async () => {
      const mockPropertyDetailsId = 1;

      jest
        .spyOn(service, 'getPropertyDetailsById')
        .mockRejectedValue(
          new NotFoundException(
            `Property Details with ID ${mockPropertyDetailsId} not found`,
          ),
        );

      await expect(
        controller.getPropertyDetailsById(mockPropertyDetailsId),
      ).rejects.toThrow(
        new NotFoundException(
          `Property Details with ID ${mockPropertyDetailsId} not found`,
        ),
      );

      expect(service.getPropertyDetailsById).toHaveBeenCalled();
    });
  });

  describe('updatePropertyDetailsById', () => {
    it('should return a updated property detail of respective id', async () => {
      const mockPropertyDetails = new PropertyDetails();

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
        mapCoordinates: 'POINT (0 0)',
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      };

      const mockUpdatePropertyDetailsDto: UpdatePropertyDetailsDto = {
        property: mockProperties,
        noOfGuestsAllowed: 1,
        noOfBedrooms: 1,
        noOfBathrooms: 1,
        squareFootage: '100 x 100',
        checkInTime: 4,
        checkOutTime: 11,
        cleaningFee: 100,
        noOfPetsAllowed: 2,
        petPolicy: 'allowed',
        feePerPet: 1000,
        peakSeasonStartDate: null,
        peakSeasonEndDate: null,
        peakSeasonAllottedNights: 2,
        offSeasonAllottedNights: 2,
        peakSeasonAllottedHolidayNights: 2,
        offSeasonAllottedHolidayNights: 2,
        lastMinuteBookingAllottedNights: 2,
        wifiNetwork: 'we23456',
        updatedBy: mockUser,
      };

      const mockPropertyDetailsId = 1;

      jest
        .spyOn(service, 'updatePropertyDetailsById')
        .mockResolvedValue(mockPropertyDetails);

      const result = await controller.updatePropertyDetailsById(
        mockPropertyDetailsId,
        mockUpdatePropertyDetailsDto,
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyDetails);
      expect(service.updatePropertyDetailsById).toHaveBeenCalledWith(
        mockPropertyDetailsId,
        mockUpdatePropertyDetailsDto,
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
        mapCoordinates: 'POINT (0 0)',
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      };

      const mockUpdatePropertyDetailsDto: UpdatePropertyDetailsDto = {
        property: mockProperties,
        noOfGuestsAllowed: 1,
        noOfBedrooms: 1,
        noOfBathrooms: 1,
        squareFootage: '100 x 100',
        checkInTime: 4,
        checkOutTime: 11,
        cleaningFee: 100,
        noOfPetsAllowed: 2,
        petPolicy: 'allowed',
        feePerPet: 1000,
        peakSeasonStartDate: null,
        peakSeasonEndDate: null,
        peakSeasonAllottedNights: 2,
        offSeasonAllottedNights: 2,
        peakSeasonAllottedHolidayNights: 2,
        offSeasonAllottedHolidayNights: 2,
        lastMinuteBookingAllottedNights: 2,
        wifiNetwork: 'we23456',
        updatedBy: mockUser,
      };

      const mockPropertyDetailsId = 1;

      jest
        .spyOn(service, 'updatePropertyDetailsById')
        .mockRejectedValue(
          new NotFoundException(
            `Property Details with ID ${mockPropertyDetailsId} not found`,
          ),
        );

      await expect(
        controller.updatePropertyDetailsById(
          mockPropertyDetailsId,
          mockUpdatePropertyDetailsDto,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(service.updatePropertyDetailsById).toHaveBeenCalled();
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
        mapCoordinates: 'POINT (0 0)',
        createdBy: mockUser,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: null,
      };

      const mockUpdatePropertyDetailsDto: UpdatePropertyDetailsDto = {
        property: mockProperties,
        noOfGuestsAllowed: 1,
        noOfBedrooms: 1,
        noOfBathrooms: 1,
        squareFootage: '100 x 100',
        checkInTime: 4,
        checkOutTime: 11,
        cleaningFee: 100,
        noOfPetsAllowed: 2,
        petPolicy: 'allowed',
        feePerPet: 1000,
        peakSeasonStartDate: null,
        peakSeasonEndDate: null,
        peakSeasonAllottedNights: 2,
        offSeasonAllottedNights: 2,
        peakSeasonAllottedHolidayNights: 2,
        offSeasonAllottedHolidayNights: 2,
        lastMinuteBookingAllottedNights: 2,
        wifiNetwork: 'we23456',
        updatedBy: mockUser,
      };

      const mockPropertyDetailsId = 1;

      jest
        .spyOn(service, 'updatePropertyDetailsById')
        .mockRejectedValue(
          new BadRequestException('Property ID does not match'),
        );

      await expect(
        controller.updatePropertyDetailsById(
          mockPropertyDetailsId,
          mockUpdatePropertyDetailsDto,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(service.updatePropertyDetailsById).toHaveBeenCalled();
    });
  });

  describe('deletePropertyDetailsById', () => {
    it('should returen a deleted property detail of respective id', async () => {
      const mockPropertyDetailsId = 1;

      const mockPropertyDetails = new PropertyDetails();

      jest
        .spyOn(service, 'deletePropertyDetailsById')
        .mockResolvedValue(mockPropertyDetails);

      const result = await controller.deletePropertyDetailsById(
        mockPropertyDetailsId,
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyDetails);
      expect(service.deletePropertyDetailsById).toHaveBeenCalledWith(
        mockPropertyDetailsId,
      );
    });

    it('should throw Error when service throws NotFoundException', async () => {
      const mockPropertyDetailsId = 1;

      jest
        .spyOn(service, 'deletePropertyDetailsById')
        .mockRejectedValue(
          new NotFoundException(
            `Property Details with ID ${mockPropertyDetailsId} not found`,
          ),
        );

      await expect(
        controller.deletePropertyDetailsById(mockPropertyDetailsId),
      ).rejects.toThrow(
        new NotFoundException(
          `Property Details with ID ${mockPropertyDetailsId} not found`,
        ),
      );

      expect(service.deletePropertyDetailsById).toHaveBeenCalled();
    });
  });
});
