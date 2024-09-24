import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { BookingController } from 'src/main/controller/booking.controller';
import { CreateBookingDTO } from 'src/main/dto/requests/booking/create-booking.dto';
import { UpdateBookingDTO } from 'src/main/dto/requests/booking/update-booking.dto';
import { Property } from 'src/main/entities/property.entity';
import { User } from 'src/main/entities/user.entity';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';
import { AdminBookingService } from 'src/main/service/booking/admin-booking.service';
import { CancelBookingService } from 'src/main/service/booking/booking-cancel.service';
import { BookingSummaryService } from 'src/main/service/booking/booking-summary.service';
import { UpdateBookingService } from 'src/main/service/booking/booking-update.service';
import { BookingService } from 'src/main/service/booking/booking.service';
import { CreateBookingService } from 'src/main/service/booking/create-booking.service';
import { BookingUtilService } from 'src/main/service/booking/utils/booking.service.util';
import { BookingMailService } from 'src/main/service/booking/utils/mail.util';
import { BookingValidationService } from 'src/main/service/booking/utils/validation.util';

describe('BookingController', () => {
  let controller: BookingController;
  let bookingService: BookingService;
  let createBookingService: CreateBookingService;
  let bookingSummaryService: BookingSummaryService;
  let updateBookingService: UpdateBookingService;
  let cancelBookingService: CancelBookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: {
            getAllBookings: jest.fn(),
            getBookingById: jest.fn(),
            getBookingsForUser: jest.fn(),
            deleteBooking: jest.fn(),
          },
        },

        {
          provide: CreateBookingService,
          useValue: {
            createBooking: jest.fn(),
          },
        },
        {
          provide: BookingSummaryService,
          useValue: {
            bookingSummary: jest.fn(),
          },
        },
        {
          provide: UpdateBookingService,
          useValue: {
            updateBooking: jest.fn(),
          },
        },
        {
          provide: CancelBookingService,
          useValue: {
            cancelBooking: jest.fn(),
          },
        },
        {
          provide: AdminBookingService,
          useValue: {
            createAdminBooking: jest.fn(),
          },
        },
        {
          provide: BookingUtilService,
          useValue: {
            getProperty: jest.fn(),
            getPropertyDetails: jest.fn(),
          },
        },
        {
          provide: BookingValidationService,
          useValue: {
            validateBookingRules: jest.fn(),
            validateBookedDates: jest.fn(),
            validateBookingGap: jest.fn(),
            validateGuestLimits: jest.fn(),
            validateUserProperty: jest.fn(),
            validateDates: jest.fn(),
          },
        },
        {
          provide: BookingMailService,
          useValue: {
            sendBookingConfirmationEmail: jest.fn(),
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

    controller = module.get<BookingController>(BookingController);
    bookingService = module.get<BookingService>(BookingService);
    createBookingService =
      module.get<CreateBookingService>(CreateBookingService);
    bookingSummaryService = module.get<BookingSummaryService>(
      BookingSummaryService,
    );
    updateBookingService =
      module.get<UpdateBookingService>(UpdateBookingService);
    cancelBookingService =
      module.get<CancelBookingService>(CancelBookingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createBooking', () => {
    it('should create a booking', async () => {
      const createBookingDto: CreateBookingDTO = {
        user: new User(),
        property: new Property(),
        checkinDate: undefined,
        checkoutDate: undefined,
        noOfGuests: 0,
        noOfPets: 0,
        isLastMinuteBooking: false,
        createdBy: new User(),
      };
      const expectedResult = { id: 1, ...createBookingDto };
      jest
        .spyOn(createBookingService, 'createBooking')
        .mockResolvedValue(expectedResult);

      const result = await controller.createBooking(createBookingDto);

      expect(result).toBe(expectedResult);
      expect(createBookingService.createBooking).toHaveBeenCalledWith(
        createBookingDto,
      );
    });
  });

  describe('bookingSummary', () => {
    it('should return a booking summary', async () => {
      const createBookingDto: CreateBookingDTO = {
        user: new User(),
        property: new Property(),
        checkinDate: undefined,
        checkoutDate: undefined,
        noOfGuests: 0,
        noOfPets: 0,
        isLastMinuteBooking: false,
        createdBy: new User(),
      };
      const expectedResult = { summary: 'mock summary' };
      jest
        .spyOn(bookingSummaryService, 'bookingSummary')
        .mockResolvedValue(expectedResult);

      const result = await controller.bookingSummary(createBookingDto);

      expect(result).toBe(expectedResult);
      expect(bookingSummaryService.bookingSummary).toHaveBeenCalledWith(
        createBookingDto,
      );
    });
  });

  describe('getAllBookings', () => {
    it('should return all bookings', async () => {
      const mockRequest = { headers: { 'user-id': '1' } } as unknown as Request;
      const expectedResult = [
        { id: 1, user: 'mockUser', property: 'mockProperty' },
      ];
      jest
        .spyOn(bookingService, 'getAllBookings')
        .mockResolvedValue(expectedResult);

      const result = await controller.getAllBookings(mockRequest);

      expect(result).toBe(expectedResult);
      expect(bookingService.getAllBookings).toHaveBeenCalledWith(1);
    });

    it('should handle errors', async () => {
      const mockRequest = { headers: { 'user-id': '1' } } as unknown as Request;
      const mockError = new Error('Test error');
      jest.spyOn(bookingService, 'getAllBookings').mockRejectedValue(mockError);

      await expect(controller.getAllBookings(mockRequest)).rejects.toThrow(
        mockError,
      );
    });
  });

  describe('getBookingById', () => {
    it('should return a booking by id', async () => {
      const mockRequest = { headers: { 'user-id': '1' } } as unknown as Request;
      const expectedResult = {
        id: 1,
        user: 'mockUser',
        property: 'mockProperty',
      };
      jest
        .spyOn(bookingService, 'getBookingById')
        .mockResolvedValue(expectedResult);

      const result = await controller.getBookingById(1, mockRequest);

      expect(result).toBe(expectedResult);
      expect(bookingService.getBookingById).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('getBookingsForUser', () => {
    it('should return bookings for a user', async () => {
      const mockRequest = { headers: { 'user-id': '1' } } as unknown as Request;
      const expectedResult = [
        { id: 1, user: 'mockUser', property: 'mockProperty' },
      ];
      jest
        .spyOn(bookingService, 'getBookingsForUser')
        .mockResolvedValue(expectedResult);

      const result = await controller.getBookingsForUser(2, mockRequest);

      expect(result).toBe(expectedResult);
      expect(bookingService.getBookingsForUser).toHaveBeenCalledWith(2, 1);
    });

    it('should handle errors', async () => {
      const mockRequest = { headers: { 'user-id': '1' } } as unknown as Request;
      const mockError = new Error('Test error');
      jest
        .spyOn(bookingService, 'getBookingsForUser')
        .mockRejectedValue(mockError);

      await expect(
        controller.getBookingsForUser(2, mockRequest),
      ).rejects.toThrow(mockError);
    });
  });

  describe('updateBooking', () => {
    it('should update a booking', async () => {
      const updateBookingDto: UpdateBookingDTO = {
        user: new User(),
        property: new Property(),
        checkinDate: undefined,
        checkoutDate: undefined,
        noOfGuests: 0,
        noOfPets: 0,
        isLastMinuteBooking: false,
        updatedBy: new User(),
      };
      const expectedResult = { id: 1, ...updateBookingDto };
      jest
        .spyOn(updateBookingService, 'updateBooking')
        .mockResolvedValue(expectedResult);

      const result = await controller.updateBooking(1, updateBookingDto);

      expect(result).toBe(expectedResult);
      expect(updateBookingService.updateBooking).toHaveBeenCalledWith(
        1,
        updateBookingDto,
      );
    });
  });

  describe('deleteBooking', () => {
    it('should delete a booking', async () => {
      const expectedResult = { success: true };
      jest
        .spyOn(bookingService, 'deleteBooking')
        .mockResolvedValue(expectedResult);

      const result = await controller.deleteBooking(1);

      expect(result).toBe(expectedResult);
      expect(bookingService.deleteBooking).toHaveBeenCalledWith(1);
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking', async () => {
      const expectedResult = { success: true };
      jest
        .spyOn(cancelBookingService, 'cancelBooking')
        .mockResolvedValue(expectedResult);

      const result = await controller.cancelBooking(1, 2);

      expect(result).toBe(expectedResult);
      expect(cancelBookingService.cancelBooking).toHaveBeenCalledWith(1, 2);
    });
  });
});
