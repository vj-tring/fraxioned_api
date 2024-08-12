import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Property } from 'src/main/entities/property.entity';
import { PropertyDetails } from 'src/main/entities/property-details.entity';
import { PropertyDetailsService } from 'src/main/service/property-details.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreatePropertyDetailsDto } from 'src/main/dto/requests/create-property-details.dto';
import { UpdatePropertyDetailsDto } from 'src/main/dto/requests/update-property-details.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from 'src/main/entities/user.entity';

describe('PropertyDetailsService', () => {
  let service: PropertyDetailsService;
  let propertiesRepository: Repository<Property>;
  let propertyDetailsRepository: Repository<PropertyDetails>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    service = module.get<PropertyDetailsService>(PropertyDetailsService);
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

  describe('createPropertyDetails', () => {
    it('should create and return a new property detail', async () => {
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
        createdBy: null,
        updatedBy: null,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      } as Property;

      const mockCreatePropertyDetailsDto: CreatePropertyDetailsDto = {
        property: {
          id: 1,
          propertyName: '',
          address: '',
          city: '',
          state: '',
          country: '',
          zipcode: 0,
          houseDescription: '',
          isExclusive: false,
          propertyShare: 0,
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: undefined,
          updatedAt: undefined,
          latitude: 0,
          longitude: 0,
          isActive: false,
        } as Property,
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
      };

      const mockPropertyDetails = {
        id: 1,
        ...mockCreatePropertyDetailsDto,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      } as PropertyDetails;

      jest
        .spyOn(propertiesRepository, 'findOne')
        .mockResolvedValue(mockProperties);
      jest
        .spyOn(propertyDetailsRepository, 'create')
        .mockReturnValue(mockPropertyDetails);
      jest
        .spyOn(propertyDetailsRepository, 'save')
        .mockResolvedValue(mockPropertyDetails);

      const result = await service.createPropertyDetails(
        mockCreatePropertyDetailsDto,
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyDetails);
      expect(propertiesRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCreatePropertyDetailsDto.property },
      });
      expect(propertyDetailsRepository.create).toHaveBeenCalledWith(
        mockCreatePropertyDetailsDto,
      );
      expect(propertyDetailsRepository.save).toHaveBeenCalledWith(
        mockPropertyDetails,
      );
    });

    it('should throw NotFoundException if property not found', async () => {
      const mockCreatePropertyDetailsDto: CreatePropertyDetailsDto = {
        property: {
          id: 1,
          propertyName: '',
          address: '',
          city: '',
          state: '',
          country: '',
          zipcode: 0,
          houseDescription: '',
          isExclusive: false,
          propertyShare: 0,
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: undefined,
          updatedAt: undefined,
          latitude: 0,
          longitude: 0,
          isActive: false,
        } as Property,
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
      };

      jest.spyOn(propertiesRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.createPropertyDetails(mockCreatePropertyDetailsDto),
      ).rejects.toThrow(
        new NotFoundException(`Properties with ID 1 not found`),
      );

      expect(propertiesRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCreatePropertyDetailsDto.property },
      });
    });
  });

  describe('getAllPropertyDetails', () => {
    it('should return all the property details', async () => {
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

      const mockPropertyDetails = [
        {
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
        } as PropertyDetails,
      ];

      jest
        .spyOn(propertyDetailsRepository, 'find')
        .mockResolvedValue(mockPropertyDetails);

      const result = await service.getAllPropertyDetails();

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyDetails);
      expect(propertyDetailsRepository.find).toHaveBeenCalledWith({
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

    it('should return NotFoundException if no property details found', async () => {
      jest.spyOn(propertyDetailsRepository, 'find').mockResolvedValue([]);

      await expect(service.getAllPropertyDetails()).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPropertyDetailsById', () => {
    it('should return a respective property detail', async () => {
      const mockPropertyDetailsId = 1;

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
      } as PropertyDetails;

      jest
        .spyOn(propertyDetailsRepository, 'findOne')
        .mockResolvedValue(mockPropertyDetails);

      const result = await service.getPropertyDetailsById(
        mockPropertyDetailsId,
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyDetails);
      expect(propertyDetailsRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPropertyDetailsId },
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

    it('should return NotFoundException if no property details found', async () => {
      const mockPropertyDetailsId = 1;

      jest.spyOn(propertyDetailsRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.getPropertyDetailsById(mockPropertyDetailsId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePropertyDetailsById', () => {
    it('should update and return a new property detail', async () => {
      const mockPropertyDetailsId = 1;

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
      } as PropertyDetails;

      jest
        .spyOn(propertyDetailsRepository, 'findOne')
        .mockResolvedValue(mockPropertyDetails);
      jest.spyOn(propertyDetailsRepository, 'merge').mockReturnValue({
        ...mockPropertyDetails,
        ...mockUpdatePropertyDetailsDto,
      });
      jest.spyOn(propertyDetailsRepository, 'save').mockResolvedValue(null);

      const result = await service.updatePropertyDetailsById(
        mockPropertyDetailsId,
        mockUpdatePropertyDetailsDto,
      );

      expect(result).toBeDefined();
      expect(result).toEqual({
        ...mockPropertyDetails,
        ...mockUpdatePropertyDetailsDto,
      });
      expect(propertyDetailsRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPropertyDetailsId },
        relations: ['createdBy', 'property', 'updatedBy'],
      });
      expect(propertyDetailsRepository.merge).toHaveBeenCalledWith(
        mockPropertyDetails,
        mockUpdatePropertyDetailsDto,
      );
      expect(propertyDetailsRepository.save).toHaveBeenCalled();
    });

    it('should return NotFoundException if no property details found', async () => {
      const mockPropertyDetailsId = 1;

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

      jest.spyOn(propertyDetailsRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updatePropertyDetailsById(
          mockPropertyDetailsId,
          mockUpdatePropertyDetailsDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return BadRequestException if property id not matched', async () => {
      const mockPropertyDetailsId = 1;

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

      const mockPropertyDetails = {
        id: 1,
        property: new Property(),
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
      } as PropertyDetails;

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

      jest
        .spyOn(propertyDetailsRepository, 'findOne')
        .mockResolvedValue(mockPropertyDetails);

      await expect(
        service.updatePropertyDetailsById(
          mockPropertyDetailsId,
          mockUpdatePropertyDetailsDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deletePropertyDetailsById', () => {
    it('should delete the property detail and return the result', async () => {
      const mockPropertyDetailsId = 1;

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
      };

      const mockPropertyDetails = {
        id: 1,
        property: mockProperties,
      } as unknown as PropertyDetails;

      jest
        .spyOn(propertyDetailsRepository, 'findOne')
        .mockResolvedValue(mockPropertyDetails);
      jest
        .spyOn(propertyDetailsRepository, 'remove')
        .mockResolvedValue(mockPropertyDetails);

      const result = await service.deletePropertyDetailsById(
        mockPropertyDetailsId,
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockPropertyDetails);
      expect(propertyDetailsRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPropertyDetailsId },
      });
      expect(propertyDetailsRepository.remove).toHaveBeenCalledWith(
        mockPropertyDetails,
      );
    });

    it('should return NotFoundException if no property details found', async () => {
      const mockPropertyDetailsId = 1;

      jest.spyOn(propertyDetailsRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.deletePropertyDetailsById(mockPropertyDetailsId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
