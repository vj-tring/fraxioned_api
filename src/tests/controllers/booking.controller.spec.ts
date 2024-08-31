import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from 'src/main/controller/booking.controller';
import { BookingService } from 'src/main/service/booking/booking.service';
import { CreateBookingDTO } from 'src/main/dto/requests/booking/create-booking.dto';
import { UpdateBookingDTO } from 'src/main/dto/requests/booking/update-booking.dto';
import { Property } from 'src/main/entities/property.entity';
import { User } from 'src/main/entities/user.entity';
import { CreateBookingService } from 'src/main/service/booking/create-booking';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { UserSession } from 'src/main/entities/user-session.entity';
import { MailService } from 'src/main/email/mail.service';
import { LoggerService } from 'src/main/service/logger.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('BookingController', () => {
  let bookingController: BookingController;
  let bookingService: BookingService;
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
      const result = { id: 1 };
      jest.spyOn(bookingService, 'updateBooking').mockResolvedValue(result);

      expect(await bookingController.updateBooking(1, updateBookingDto)).toBe(
        result,
      );
      expect(bookingService.updateBooking).toHaveBeenCalledWith(
        1,
        updateBookingDto,
      );
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
