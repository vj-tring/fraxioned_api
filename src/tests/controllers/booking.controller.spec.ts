import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from 'src/main/controller/booking.controller';
import { BookingService } from 'src/main/service/booking/booking.service';
import { CreateBookingDTO } from 'src/main/dto/requests/booking/create-booking.dto';
import { Property } from 'src/main/entities/property.entity';
import { User } from 'src/main/entities/user.entity';
import { CreateBookingService } from 'src/main/service/booking/create-booking.service';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { UserSession } from 'src/main/entities/user-session.entity';
import { MailService } from 'src/main/email/mail.service';
import { LoggerService } from 'src/main/service/logger.service';
import { MailerService } from '@nestjs-modules/mailer';
import { BookingSummaryService } from 'src/main/service/booking/booking-summary.service';
import { UpdateBookingService } from 'src/main/service/booking/booking-update.service';
import { CancelBookingService } from 'src/main/service/booking/booking-cancel.service';

describe('BookingController', () => {
  let bookingController: BookingController;
  let bookingService: BookingService;
  let bookingSummaryService: BookingSummaryService;
  let createBookingService: CreateBookingService;

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
            updateBooking: jest.fn(),
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
          provide: CancelBookingService,
          useValue: {
            cancelBooking: jest.fn(),
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
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserContactDetails),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserSession),
          useClass: Repository,
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        AuthenticationService,
        MailService,
        LoggerService,
        AuthGuard,
      ],
    }).compile();

    bookingController = module.get<BookingController>(BookingController);
    bookingService = module.get<BookingService>(BookingService);
    bookingSummaryService = module.get<BookingSummaryService>(
      BookingSummaryService,
    );
    createBookingService =
      module.get<CreateBookingService>(CreateBookingService);
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
      const result = { id: 1 };
      jest
        .spyOn(createBookingService, 'createBooking')
        .mockResolvedValue(result);

      expect(await bookingController.createBooking(createBookingDto)).toBe(
        result,
      );
      expect(createBookingService.createBooking).toHaveBeenCalledWith(
        createBookingDto,
      );
    });
  });

  describe('bookingSummary', () => {
    it('should return booking summary', async () => {
      const createBookingDto: CreateBookingDTO = {
        user: new User(),
        property: new Property(),
        checkinDate: new Date('2023-12-10'),
        checkoutDate: new Date('2023-12-15'),
        noOfGuests: 2,
        noOfPets: 1,
        isLastMinuteBooking: false,
        createdBy: new User(),
      };
      const result = { summary: 'booking summary' };
      jest
        .spyOn(bookingSummaryService, 'bookingSummary')
        .mockResolvedValue(result);

      expect(await bookingController.bookingSummary(createBookingDto)).toBe(
        result,
      );
      expect(bookingSummaryService.bookingSummary).toHaveBeenCalledWith(
        createBookingDto,
      );
    });

    it('should handle errors', async () => {
      const createBookingDto: CreateBookingDTO = {
        user: new User(),
        property: new Property(),
        checkinDate: new Date('2023-12-10'),
        checkoutDate: new Date('2023-12-15'),
        noOfGuests: 2,
        noOfPets: 1,
        isLastMinuteBooking: false,
        createdBy: new User(),
      };
      const error = new Error('Error generating booking summary');
      jest
        .spyOn(bookingSummaryService, 'bookingSummary')
        .mockRejectedValue(error);

      await expect(
        bookingController.bookingSummary(createBookingDto),
      ).rejects.toThrow(error);
      expect(bookingSummaryService.bookingSummary).toHaveBeenCalledWith(
        createBookingDto,
      );
    });

    it('should validate booking dates', async () => {
      const createBookingDto: CreateBookingDTO = {
        user: new User(),
        property: new Property(),
        checkinDate: new Date('2023-12-10'),
        checkoutDate: new Date('2023-12-15'),
        noOfGuests: 2,
        noOfPets: 1,
        isLastMinuteBooking: false,
        createdBy: new User(),
      };
      const result = { error: 'Checkout date must be after checkin date' };
      jest
        .spyOn(bookingSummaryService, 'bookingSummary')
        .mockResolvedValue(result);

      expect(await bookingController.bookingSummary(createBookingDto)).toBe(
        result,
      );
      expect(bookingSummaryService.bookingSummary).toHaveBeenCalledWith(
        createBookingDto,
      );
    });
  });

  describe('getAllBookings', () => {
    it('should return an array of bookings', async () => {
      const result = [{ id: 1 }, { id: 2 }];
      jest.spyOn(bookingService, 'getAllBookings').mockResolvedValue(result);

      expect(await bookingController.getAllBookings()).toBe(result);
      expect(bookingService.getAllBookings).toHaveBeenCalled();
    });

    it('should throw an error if service throws', async () => {
      const error = new Error('Error fetching bookings');
      jest.spyOn(bookingService, 'getAllBookings').mockRejectedValue(error);

      await expect(bookingController.getAllBookings()).rejects.toThrow(error);
    });
  });

  describe('getBookingById', () => {
    it('should return a booking by ID', async () => {
      const result = { id: 1 };
      jest.spyOn(bookingService, 'getBookingById').mockResolvedValue(result);

      expect(await bookingController.getBookingById(1)).toBe(result);
      expect(bookingService.getBookingById).toHaveBeenCalledWith(1);
    });
  });

  describe('getBookingsForUser', () => {
    it('should return bookings for a user', async () => {
      const userId = 1;
      const result = [
        { id: 1, user: { id: userId } },
        { id: 2, user: { id: userId } },
      ];
      jest
        .spyOn(bookingService, 'getBookingsForUser')
        .mockResolvedValue(result);

      expect(await bookingController.getBookingsForUser(userId)).toBe(result);
      expect(bookingService.getBookingsForUser).toHaveBeenCalledWith(userId);
    });

    it('should throw an error if service throws', async () => {
      const userId = 1;
      const error = new Error('Error fetching bookings for user');
      jest.spyOn(bookingService, 'getBookingsForUser').mockRejectedValue(error);

      await expect(
        bookingController.getBookingsForUser(userId),
      ).rejects.toThrow(error);
    });
  });

  describe('deleteBooking', () => {
    it('should delete a booking', async () => {
      const result = { id: 1 };
      jest.spyOn(bookingService, 'deleteBooking').mockResolvedValue(result);

      expect(await bookingController.deleteBooking(1)).toBe(result);
      expect(bookingService.deleteBooking).toHaveBeenCalledWith(1);
    });
  });
});
