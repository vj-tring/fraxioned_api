import { Test, TestingModule } from '@nestjs/testing';
import { CreateHolidayDto } from 'dto/requests/create-holiday.dto';
import { UpdateHolidayDto } from 'dto/requests/update-holiday.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Holidays } from 'src/main/entities/holidays.entity';
import { HolidaysController } from 'src/main/controller/holidays.controller';
import { HolidaysService } from 'src/main/service/holidays.service';
import { LoggerService } from 'src/main/service/logger.service';
import { User } from 'src/main/entities/user.entity';
import { HOLIDAYS_RESPONSES } from 'src/main/commons/constants/response-constants/holiday.constants';
import { Role } from 'src/main/entities/role.entity';
import { AuthenticationService } from 'src/main/service/authentication.service';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { AmenitiesController } from 'src/main/controller/amenities.controller';
import { AmenitiesService } from 'src/main/service/amenities.service';
import { CreateAmenitiesDto } from 'src/main/dto/requests/create-amenities.dto';
import { Amenities } from 'src/main/entities/amenities.entity';
import { AMENITIES_RESPONSES } from 'src/main/commons/constants/response-constants/amenities.constant';
import { UpdateAmenitiesDto } from 'src/main/dto/requests/update-amenities.dto';

describe('AmenitiesController', () => {
  let controller: AmenitiesController;
  let service: AmenitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmenitiesController],
      providers: [
        {
          provide: AmenitiesService,
          useValue: {
            createAmenity: jest.fn(),
            findAllAmenities: jest.fn(),
            findAmenityById: jest.fn(),
            updateAmenityDetailById: jest.fn(),
            deleteAmenityById: jest.fn(),
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
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<AmenitiesController>(AmenitiesController);
    service = module.get<AmenitiesService>(AmenitiesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const createAmenityDto: CreateAmenitiesDto = {
    amenityName: 'Test Amenity',
    amenityDescription: 'Test Amenity Description',
    amenityType: 'Test Amenity Type',
    createdBy: {
      id: 1,
      role: new Role(),
      firstName: '',
      lastName: '',
      password: '',
      imageURL: '',
      isActive: false,
      addressLine1: '',
      addressLine2: '',
      state: '',
      country: '',
      city: '',
      zipcode: '',
      resetToken: '',
      resetTokenExpires: undefined,
      lastLoginTime: undefined,
      createdBy: 0,
      updatedBy: 0,
      createdAt: undefined,
      updatedAt: undefined,
    } as User,
  };

  describe('createHolcreateAmenityiday', () => {
    it('should create an amenity', async () => {
      
      const expectedAmenity: Amenities = {
        id: 1,
        amenityName: 'Test Amenity',
        amenityDescription: 'Test Amenity Description',
        amenityType: 'Test Amenity Type',
        createdBy: { id: 1 } as User,
        updatedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedResult =
        AMENITIES_RESPONSES.AMENITY_CREATED(expectedAmenity, createAmenityDto.amenityName, 1);
      jest.spyOn(service, 'createAmenity').mockResolvedValue(expectedResult);

      expect(await controller.createAmenity(createAmenityDto)).toEqual(
        expectedResult,
      );
    });

    it('should throw an HttpException if an error occurs', async () => {
      
      const error = new Error('An error occurred');
      jest.spyOn(service, 'createAmenity').mockRejectedValue(error);

      try {
        await controller.createAmenity(createAmenityDto);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while creating the amenity',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getAllAmenities', () => {
    it('should get all amenities', async () => {
   
    const expectedResult = AMENITIES_RESPONSES.AMENITIES_FETCHED([]);
      jest
        .spyOn(service, 'findAllAmenities')
        .mockResolvedValue(expectedResult);

      expect(await controller.getAllAmenities()).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'findAllAmenities').mockRejectedValue(error);

      try {
        await controller.getAllAmenities();
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving all amenities',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getAmenityById', () => {
    it('should get amenity by ID', async () => {
      const mockAmenity: Amenities = {
        id: 1,
        amenityName: 'Test Amenity',
        amenityDescription: 'Test Amenity Description',
        amenityType: 'Test Amenity Type',
        createdBy: { id: 1 } as User,
        updatedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedResult = AMENITIES_RESPONSES.AMENITY_FETCHED(mockAmenity, mockAmenity.id);

      const id = 1;
      jest.spyOn(service, 'findAmenityById').mockResolvedValue(expectedResult);

      expect(await controller.getAmenityById(id)).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      const id = 1;
      jest.spyOn(service, 'findAmenityById').mockRejectedValue(error);

      try {
        await controller.getAmenityById(id);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving the amenity',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('updateAmenityDetail', () => {
    it('should update amenity details', async () => {
      const updateAmenitiesDto: UpdateAmenitiesDto = {
        amenityName: ' Updated Test Amenity',
        amenityDescription: 'Test Amenity Description',
        amenityType: 'Test Amenity Type',
        updatedBy: {
          id: 1,
          role: new Role(),
          firstName: '',
          lastName: '',
          password: '',
          imageURL: '',
          isActive: false,
          addressLine1: '',
          addressLine2: '',
          state: '',
          country: '',
          city: '',
          zipcode: '',
          resetToken: '',
          resetTokenExpires: undefined,
          lastLoginTime: undefined,
          createdBy: 0,
          updatedBy: 0,
          createdAt: undefined,
          updatedAt: undefined,
        } as User,
      };
      const amenity = { id: 1 } as Amenities;
      const expectedResult = AMENITIES_RESPONSES.AMENITY_UPDATED(amenity, amenity.id);

      jest
        .spyOn(service, 'updateAmenityDetailById')
        .mockResolvedValue(expectedResult);

      expect(
        await controller.updateAmenityDetail('1', updateAmenitiesDto),
      ).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'updateAmenityDetailById').mockRejectedValue(error);

      try {
        await controller.updateAmenityDetail('1', {} as UpdateAmenitiesDto);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while updating the amenity',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('deleteAmenity', () => {
    it('should delete amenity by id', async () => {
      const deleteResult = {
        raw: {},
        affected: 1,
      };
      const expectedResult = AMENITIES_RESPONSES.AMENITY_DELETED(
        deleteResult.affected,
      );

      jest
        .spyOn(service, 'deleteAmenityById')
        .mockResolvedValue(expectedResult);

      expect(await controller.deleteAmenity(1)).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'deleteAmenityById').mockRejectedValue(error);

      try {
        await controller.deleteAmenity(1);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while deleting the amenity',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
