import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { UserProperties } from 'entities/user-properties.entity';
import { PropertyDetails } from 'entities/property-details.entity';
import { PropertySeasonHolidays } from 'entities/property-season-holidays.entity';
import { LoggerService } from 'services/logger.service';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { UpdateBookingDTO } from 'src/main/dto/requests/booking/update-booking.dto';
import { BookingService } from 'src/main/service/booking/booking.service';
import { User } from 'src/main/entities/user.entity';
import { Property } from 'src/main/entities/property.entity';
import { CreateBookingService } from 'src/main/service/booking/create-booking.service';
import { BookingHistory } from 'src/main/entities/booking-history.entity';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { MailService } from 'src/main/email/mail.service';
import { SpaceTypes } from 'src/main/entities/space-types.entity';
import { PropertyImages } from 'src/main/entities/property_images.entity';
import { BookingUtilService } from 'src/main/utils/booking/booking.service.util';
import { BookingMailService } from 'src/main/utils/booking/mail.util';
import { BookingValidationService } from 'src/main/utils/booking/validation.util';

describe('BookingService', () => {
  let service: BookingService;
  let bookingRepository: Repository<Booking>;
  let userRepository: Repository<User>;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: MailService, useValue: { sendMail: jest.fn() } },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: BookingUtilService,
          useValue: {
            getProperty: jest.fn(),
          },
        },
        {
          provide: BookingMailService,
          useValue: {
            sendBookingConfirmationEmail: jest.fn(),
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
        CreateBookingService,
        {
          provide: getRepositoryToken(Booking),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(BookingHistory),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserProperties),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Property),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PropertyDetails),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PropertySeasonHolidays),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserContactDetails),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(SpaceTypes),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PropertyImages),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingRepository = module.get<Repository<Booking>>(
      getRepositoryToken(Booking),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    loggerService = module.get<LoggerService>(LoggerService);
  });

  describe('getAllBookings', () => {
    it('should return all bookings', async () => {
      const bookings = [
        {
          id: 1,
          property: { id: 1, propertyName: 'Test Property' },
        } as Booking,
        {
          id: 2,
          property: { id: 2, propertyName: 'Test Property' },
        } as Booking,
      ];
      const requestedUser = 1;
      jest.spyOn(bookingRepository, 'find').mockResolvedValue(bookings);
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue({ role: { id: 2 } } as User);
      const result = await service.getAllBookings(requestedUser);
      expect(result).toEqual(bookings);
    });

    it('should return BOOKINGS_NOT_FOUND if no bookings found', async () => {
      jest.spyOn(bookingRepository, 'find').mockResolvedValue([]);
      const requestedUser = 1;
      const result = await service.getAllBookings(requestedUser);
      expect(result).toEqual(BOOKING_RESPONSES.BOOKINGS_NOT_FOUND());
    });
  });
  describe('getBookingById', () => {
    it('should return a booking by ID', async () => {
      const booking = {
        id: 1,
        property: { id: 1, propertyName: 'Test Property' },
      } as Booking;
      jest
        .spyOn(bookingRepository, 'findOne')
        .mockResolvedValue(booking as Booking);
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue({ role: { id: 2 } } as User);
      const requestedUser = 1;
      const result = await service.getBookingById(1, requestedUser);
      expect(result).toEqual({
        ...booking,
        property: { ...booking.property, propertyName: 'Paradise Shores' },
      });
    });

    it('should return BOOKING_NOT_FOUND if booking does not exist', async () => {
      jest.spyOn(bookingRepository, 'findOne').mockResolvedValue(null);
      const requestedUser = 1;
      const result = await service.getBookingById(1, requestedUser);
      expect(result).toEqual(BOOKING_RESPONSES.BOOKING_NOT_FOUND(1));
    });
  });

  describe('getBookingsForUser', () => {
    it('should return bookings for a user', async () => {
      const userId = 1;
      const bookings = [
        {
          id: 1,
          user: { id: userId },
          property: { id: 1, propertyName: 'Test Property' },
        } as Booking,
        {
          id: 2,
          user: { id: userId },
          property: { id: 2, propertyName: 'Test Property' },
        } as Booking,
      ];
      jest.spyOn(bookingRepository, 'find').mockResolvedValue(bookings);
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue({ role: { id: 2 } } as User);
      const requestedUser = 1;
      const result = await service.getBookingsForUser(requestedUser, userId);
      expect(result).toEqual(bookings);
      expect(loggerService.log).toHaveBeenCalledWith(
        `Fetching bookings for user with ID ${userId}`,
      );
    });

    it('should return BOOKING_FOR_USER_NOT_FOUND if no bookings found for user', async () => {
      const userId = 1;
      const requestedUser = 1;
      jest.spyOn(bookingRepository, 'find').mockResolvedValue([]);
      const result = await service.getBookingsForUser(requestedUser, userId);
      expect(result).toEqual(
        BOOKING_RESPONSES.BOOKING_FOR_USER_NOT_FOUND(userId),
      );
      expect(loggerService.warn).toHaveBeenCalledWith(
        `No bookings found for user with ID ${userId}`,
      );
    });

    it('should handle unexpected errors', async () => {
      const userId = 1;
      const requestedUser = 1;
      const error = new Error('Unexpected error');
      jest.spyOn(bookingRepository, 'find').mockRejectedValue(error);
      await expect(
        service.getBookingsForUser(requestedUser, userId),
      ).rejects.toThrow(error);
      expect(loggerService.log).toHaveBeenCalledWith(
        `Fetching bookings for user with ID ${userId}`,
      );
    });
  });

  describe('updateBooking', () => {
    it('should update a booking', async () => {
      const booking = {
        id: 1,
        property: { id: 1, propertyName: 'Test Property' },
      } as Booking;
      const updateBookingDto: UpdateBookingDTO = {
        checkinDate: new Date('2023-01-01'),
        user: new User(),
        property: new Property(),
        checkoutDate: undefined,
        noOfGuests: 0,
        noOfPets: 0,
        isLastMinuteBooking: false,
        updatedBy: new User(),
      } as Booking;
      jest
        .spyOn(bookingRepository, 'findOne')
        .mockResolvedValue(booking as Booking);
      jest
        .spyOn(bookingRepository, 'save')
        .mockResolvedValue({ ...booking, ...updateBookingDto });
      const result = await service.updateBooking(1, updateBookingDto);
      expect(result).toEqual(
        BOOKING_RESPONSES.BOOKING_UPDATED({
          ...booking,
          ...updateBookingDto,
          createdAt: undefined,
          updatedAt: undefined,
          cancelledAt: undefined,
          updatedBy: new User(),
        } as Booking),
      );
    });

    it('should return BOOKING_NOT_FOUND if booking does not exist', async () => {
      jest.spyOn(bookingRepository, 'findOne').mockResolvedValue(null);
      const result = await service.updateBooking(1, {} as UpdateBookingDTO);
      expect(result).toEqual(BOOKING_RESPONSES.BOOKING_NOT_FOUND(1));
    });
  });

  describe('deleteBooking', () => {
    it('should delete a booking', async () => {
      const booking = {
        id: 1,
        property: { id: 1, propertyName: 'Test Property' },
      } as Booking;
      jest.spyOn(bookingRepository, 'findOne').mockResolvedValue(booking);
      jest.spyOn(bookingRepository, 'remove').mockResolvedValue(booking);
      const result = await service.deleteBooking(1);
      expect(result).toEqual(BOOKING_RESPONSES.BOOKING_DELETED(1));
    });

    it('should return BOOKING_NOT_FOUND if booking does not exist', async () => {
      jest.spyOn(bookingRepository, 'findOne').mockResolvedValue(null);
      const result = await service.deleteBooking(1);
      expect(result).toEqual(BOOKING_RESPONSES.BOOKING_NOT_FOUND(1));
    });
  });
});
