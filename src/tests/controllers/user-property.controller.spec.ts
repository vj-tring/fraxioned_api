import { Test, TestingModule } from '@nestjs/testing';
import { UserPropertyController } from 'controllers/user-property.controller';
import { UserPropertyService } from 'services/user-property.service';
import { CreateUserPropertyDTO } from 'dto/requests/create-user-property.dto';
import { UpdateUserPropertyDTO } from 'dto/requests/update-user-property.dto';
import { USER_PROPERTY_RESPONSES } from 'src/main/commons/constants/response-constants/user-property.response.constant';
import { NotFoundException } from '@nestjs/common';
import { Role } from 'src/main/entities/role.entity';
import { User } from 'src/main/entities/user.entity';
import { UserProperties } from 'entities/user-properties.entity';
import { Properties } from 'src/main/entities/properties.entity';
import { AuthenticationService } from 'src/main/service/authentication.service';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';

describe('UserPropertyController', () => {
  let controller: UserPropertyController;
  let service: UserPropertyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserPropertyController],
      providers: [
        {
          provide: UserPropertyService,
          useValue: {
            createUserProperty: jest.fn(),
            getUserProperties: jest.fn(),
            getUserPropertyById: jest.fn(),
            updateUserProperty: jest.fn(),
            deleteUserProperty: jest.fn(),
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

    controller = module.get<UserPropertyController>(UserPropertyController);
    service = module.get<UserPropertyService>(UserPropertyService);
  });

  describe('createUserProperty', () => {
    it('should create a new user property', async () => {
      const createUserPropertyDto: CreateUserPropertyDTO = {
        user: {
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
        },
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
          mapCoordinates: '',
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: undefined,
          updatedAt: undefined,
        },
        noOfShare: 1,
        acquisitionDate: new Date(),
        isActive: true,
        year: 2023,
        peakAllottedNights: 10,
        peakUsedNights: 5,
        peakBookedNights: 5,
        peakCancelledNights: 0,
        peakLostNights: 0,
        peakRemainingNights: 5,
        peakAllottedHolidayNights: 5,
        peakUsedHolidayNights: 2,
        peakBookedHolidayNights: 2,
        peakRemainingHolidayNights: 3,
        peakCancelledHolidayNights: 0,
        peakLostHolidayNights: 0,
        offAllottedNights: 10,
        offUsedNights: 5,
        offBookedNights: 5,
        offCancelledNights: 0,
        offLostNights: 0,
        offRemainingNights: 5,
        offAllottedHolidayNights: 5,
        offUsedHolidayNights: 2,
        offBookedHolidayNights: 2,
        offRemainingHolidayNights: 3,
        offCancelledHolidayNights: 0,
        offLostHolidayNights: 0,
        lastMinuteAllottedNights: 5,
        lastMinuteUsedNights: 2,
        lastMinuteBookedNights: 2,
        lastMinuteRemainingNights: 3,
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
        },
      };

      jest.spyOn(service, 'createUserProperty').mockResolvedValue(
        USER_PROPERTY_RESPONSES.USER_PROPERTY_CREATED({
          id: 1,
          ...createUserPropertyDto,
        }),
      );

      const result = await controller.createUserProperty(createUserPropertyDto);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTY_CREATED({
          id: 1,
          ...createUserPropertyDto,
        }),
      );
      expect(service.createUserProperty).toHaveBeenCalledWith(
        createUserPropertyDto,
      );
    });
  });

  describe('getUserProperties', () => {
    it('should fetch all user properties', async () => {
      const userProperties: UserProperties[] = [
        {
          id: 1,
          user: new User(),
          property: new Properties(),
          noOfShare: 1,
          acquisitionDate: new Date(),
          isActive: true,
          year: 2023,
          peakAllottedNights: 10,
          peakUsedNights: 5,
          peakBookedNights: 5,
          peakCancelledNights: 0,
          peakLostNights: 0,
          peakRemainingNights: 5,
          peakAllottedHolidayNights: 5,
          peakUsedHolidayNights: 2,
          peakBookedHolidayNights: 2,
          peakRemainingHolidayNights: 3,
          peakCancelledHolidayNights: 0,
          peakLostHolidayNights: 0,
          offAllottedNights: 10,
          offUsedNights: 5,
          offBookedNights: 5,
          offCancelledNights: 0,
          offLostNights: 0,
          offRemainingNights: 5,
          offAllottedHolidayNights: 5,
          offUsedHolidayNights: 2,
          offBookedHolidayNights: 2,
          offRemainingHolidayNights: 3,
          offCancelledHolidayNights: 0,
          offLostHolidayNights: 0,
          lastMinuteAllottedNights: 5,
          lastMinuteUsedNights: 2,
          lastMinuteBookedNights: 2,
          lastMinuteRemainingNights: 3,
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest
        .spyOn(service, 'getUserProperties')
        .mockResolvedValue(
          USER_PROPERTY_RESPONSES.USER_PROPERTIES_FETCHED(userProperties),
        );

      const result = await controller.getUserProperties();

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTIES_FETCHED(userProperties),
      );
      expect(service.getUserProperties).toHaveBeenCalled();
    });
  });

  describe('getUserPropertyById', () => {
    it('should fetch a user property by ID', async () => {
      const userProperty: UserProperties = {
        id: 1,
        user: new User(),
        property: new Properties(),
        noOfShare: 1,
        acquisitionDate: new Date(),
        isActive: true,
        year: 2023,
        peakAllottedNights: 10,
        peakUsedNights: 5,
        peakBookedNights: 5,
        peakCancelledNights: 0,
        peakLostNights: 0,
        peakRemainingNights: 5,
        peakAllottedHolidayNights: 5,
        peakUsedHolidayNights: 2,
        peakBookedHolidayNights: 2,
        peakRemainingHolidayNights: 3,
        peakCancelledHolidayNights: 0,
        peakLostHolidayNights: 0,
        offAllottedNights: 10,
        offUsedNights: 5,
        offBookedNights: 5,
        offCancelledNights: 0,
        offLostNights: 0,
        offRemainingNights: 5,
        offAllottedHolidayNights: 5,
        offUsedHolidayNights: 2,
        offBookedHolidayNights: 2,
        offRemainingHolidayNights: 3,
        offCancelledHolidayNights: 0,
        offLostHolidayNights: 0,
        lastMinuteAllottedNights: 5,
        lastMinuteUsedNights: 2,
        lastMinuteBookedNights: 2,
        lastMinuteRemainingNights: 3,
        createdBy: new User(),
        updatedBy: new User(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(service, 'getUserPropertyById')
        .mockResolvedValue(userProperty);

      const result = await controller.getUserPropertyById(1);

      expect(result).toEqual(userProperty);
      expect(service.getUserPropertyById).toHaveBeenCalledWith(1);
    });

    it('should throw an error if the user property is not found', async () => {
      jest
        .spyOn(service, 'getUserPropertyById')
        .mockRejectedValue(
          new NotFoundException('User property with ID 1 not found'),
        );

      await expect(controller.getUserPropertyById(1)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.getUserPropertyById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateUserProperty', () => {
    it('should update a user property', async () => {
      const updateUserPropertyDto: UpdateUserPropertyDTO = {
        noOfShare: 2,
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
        },
      };
      const updatedUserProperty: UserProperties = {
        id: 1,
        user: new User(),
        property: new Properties(),
        noOfShare: 2,
        acquisitionDate: new Date(),
        isActive: true,
        year: 2023,
        peakAllottedNights: 10,
        peakUsedNights: 5,
        peakBookedNights: 5,
        peakCancelledNights: 0,
        peakLostNights: 0,
        peakRemainingNights: 5,
        peakAllottedHolidayNights: 5,
        peakUsedHolidayNights: 2,
        peakBookedHolidayNights: 2,
        peakRemainingHolidayNights: 3,
        peakCancelledHolidayNights: 0,
        peakLostHolidayNights: 0,
        offAllottedNights: 10,
        offUsedNights: 5,
        offBookedNights: 5,
        offCancelledNights: 0,
        offLostNights: 0,
        offRemainingNights: 5,
        offAllottedHolidayNights: 5,
        offUsedHolidayNights: 2,
        offBookedHolidayNights: 2,
        offRemainingHolidayNights: 3,
        offCancelledHolidayNights: 0,
        offLostHolidayNights: 0,
        lastMinuteAllottedNights: 5,
        lastMinuteUsedNights: 2,
        lastMinuteBookedNights: 2,
        lastMinuteRemainingNights: 3,
        createdBy: new User(),
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
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(service, 'updateUserProperty')
        .mockResolvedValue(
          USER_PROPERTY_RESPONSES.USER_PROPERTY_UPDATED(updatedUserProperty),
        );

      const result = await controller.updateUserProperty(
        1,
        updateUserPropertyDto,
      );

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.USER_PROPERTY_UPDATED(updatedUserProperty),
      );
      expect(service.updateUserProperty).toHaveBeenCalledWith(
        1,
        updateUserPropertyDto,
      );
    });

    it('should throw an error if the user property is not found', async () => {
      const updateUserPropertyDto: UpdateUserPropertyDTO = {
        noOfShare: 2,
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
        },
      };
      jest
        .spyOn(service, 'updateUserProperty')
        .mockRejectedValue(
          new NotFoundException('User property with ID 1 not found'),
        );

      await expect(
        controller.updateUserProperty(1, updateUserPropertyDto),
      ).rejects.toThrow(NotFoundException);
      expect(service.updateUserProperty).toHaveBeenCalledWith(
        1,
        updateUserPropertyDto,
      );
    });
  });

  describe('deleteUserProperty', () => {
    it('should delete a user property', async () => {
      jest
        .spyOn(service, 'deleteUserProperty')
        .mockResolvedValue(USER_PROPERTY_RESPONSES.USER_PROPERTY_DELETED);

      const result = await controller.deleteUserProperty(1);

      expect(result).toEqual(USER_PROPERTY_RESPONSES.USER_PROPERTY_DELETED);
      expect(service.deleteUserProperty).toHaveBeenCalledWith(1);
    });

    it('should throw an error if the user property is not found', async () => {
      jest
        .spyOn(service, 'deleteUserProperty')
        .mockRejectedValue(
          new NotFoundException('User property with ID 1 not found'),
        );

      await expect(controller.deleteUserProperty(1)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.deleteUserProperty).toHaveBeenCalledWith(1);
    });
  });
});
