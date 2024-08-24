import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from 'src/main/entities/user.entity';
import { Role } from 'src/main/entities/role.entity';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { Property } from 'src/main/entities/property.entity';
import { PropertyAmenitiesController } from 'src/main/controller/property-amenities.controller';
import { PropertyAmenitiesService } from 'src/main/service/property-amenities.service';
import { PropertyAmenities } from 'src/main/entities/property_amenities.entity';
import { Amenities } from 'src/main/entities/amenities.entity';
import { PROPERTY_AMENITY_RESPONSES } from 'src/main/commons/constants/response-constants/property-amenities.constant';
import { CreatePropertyAmenitiesDto } from 'src/main/dto/requests/property-aminity/create-property-amenities.dto';
import { UpdatePropertyAmenitiesDto } from 'src/main/dto/requests/property-aminity/update-property-amenities.dto';

describe('PropertyAmenitiesController', () => {
  let controller: PropertyAmenitiesController;
  let service: PropertyAmenitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyAmenitiesController],
      providers: [
        {
          provide: PropertyAmenitiesService,
          useValue: {
            createPropertyAmenity: jest.fn(),
            findAllPropertySAmenities: jest.fn(),
            findPropertyAmenityById: jest.fn(),
            updatePropertyAmenityHoliday: jest.fn(),
            removePropertyAmenity: jest.fn(),
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
        AuthGuard,
      ],
    }).compile();

    controller = module.get<PropertyAmenitiesController>(
      PropertyAmenitiesController,
    );
    service = module.get<PropertyAmenitiesService>(PropertyAmenitiesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const createPropertyAmenityDto: CreatePropertyAmenitiesDto = {
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
    } as Property,
    amenity: {
      id: 1,
      amenityName: '',
      amenityDescription: '',
      amenityType: '',
      createdBy: new User(),
      updatedBy: new User(),
      createdAt: undefined,
      updatedAt: undefined,
    },
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

  describe('createPropertyAmenity', () => {
    it('should create a property amenity', async () => {
      const expectedPropertyAmenity: PropertyAmenities = {
        id: 1,
        property: { id: 1 } as Property,
        amenity: { id: 1 } as Amenities,
        createdBy: { id: 1 } as User,
        updatedBy: new User(),
        createdAt: new Date(),
        updatedAt: undefined,
      };
      const expectedResult =
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_CREATED(
          expectedPropertyAmenity,
          1,
        );
      jest
        .spyOn(service, 'createPropertyAmenity')
        .mockResolvedValue(expectedResult);

      expect(
        await controller.createPropertyAmenity(createPropertyAmenityDto),
      ).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'createPropertyAmenity').mockRejectedValue(error);

      try {
        await controller.createPropertyAmenity(createPropertyAmenityDto);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while creating the property amenity',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getAllPropertyAmenities', () => {
    it('should get all property amenities', async () => {
      const expectedResult =
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITIES_FETCHED([]);
      jest
        .spyOn(service, 'findAllPropertySAmenities')
        .mockResolvedValue(expectedResult);

      expect(await controller.getAllPropertyAmenities()).toEqual(
        expectedResult,
      );
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'findAllPropertySAmenities').mockRejectedValue(error);

      try {
        await controller.getAllPropertyAmenities();
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving all property amenities',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getPropertyAmenityById', () => {
    it('should get property amenity by ID', async () => {
      const mockPropertyAmenity: PropertyAmenities = {
        id: 1,
        property: { id: 1 } as Property,
        amenity: { id: 1 } as Amenities,
        createdBy: { id: 1 } as User,
        updatedBy: new User(),
        createdAt: new Date(),
        updatedAt: undefined,
      };

      const expectedResult =
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_FETCHED(
          mockPropertyAmenity,
          mockPropertyAmenity.id,
        );

      jest
        .spyOn(service, 'findPropertyAmenityById')
        .mockResolvedValue(expectedResult);

      expect(
        await controller.getPropertyAmenityById(mockPropertyAmenity.id),
      ).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      const id = 1;
      jest.spyOn(service, 'findPropertyAmenityById').mockRejectedValue(error);

      try {
        await controller.getPropertyAmenityById(id);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving the property amenity',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('updatePropertyAmenityDetail', () => {
    it('should update property amenity details', async () => {
      const updatePropertyAmenityDto: UpdatePropertyAmenitiesDto = {
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
        } as Property,
        amenity: {
          id: 1,
          amenityName: '',
          amenityDescription: '',
          amenityType: '',
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: undefined,
          updatedAt: undefined,
        },
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
      const propertyAmenity = { id: 1 } as PropertyAmenities;
      const expectedResult =
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_UPDATED(
          propertyAmenity,
          propertyAmenity.id,
        );

      jest
        .spyOn(service, 'updatePropertyAmenityHoliday')
        .mockResolvedValue(expectedResult);

      expect(
        await controller.updatePropertyAmenityDetail(
          '1',
          updatePropertyAmenityDto,
        ),
      ).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest
        .spyOn(service, 'updatePropertyAmenityHoliday')
        .mockRejectedValue(error);

      try {
        await controller.updatePropertyAmenityDetail(
          '1',
          {} as UpdatePropertyAmenitiesDto,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while updating the property amenity',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('deletePropertyAmenity', () => {
    it('should delete property amenity by id', async () => {
      const deleteResult = {
        raw: {},
        affected: 1,
      };
      const expectedResult =
        PROPERTY_AMENITY_RESPONSES.PROPERTY_AMENITY_DELETED(
          deleteResult.affected,
        );

      jest
        .spyOn(service, 'removePropertyAmenity')
        .mockResolvedValue(expectedResult);

      expect(
        await controller.deletePropertyAmenity(deleteResult.affected),
      ).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'removePropertyAmenity').mockRejectedValue(error);

      try {
        await controller.deletePropertyAmenity(1);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while deleting the property amenity',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
