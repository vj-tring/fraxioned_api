import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { UserProperties } from 'entities/user-properties.entity';
import { PropertyDetails } from 'entities/property-details.entity';
import { PropertySeasonHolidays } from 'entities/property-season-holidays.entity';
import { LoggerService } from 'services/logger.service';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { NotFoundException } from '@nestjs/common';
import { UpdateBookingDTO } from 'src/main/dto/requests/booking/update-booking.dto';
import { BookingService } from 'src/main/service/booking/booking.service';
import { User } from 'src/main/entities/user.entity';
import { Property } from 'src/main/entities/property.entity';
import { CreateBookingService } from 'src/main/service/booking/create-booking';

describe('BookingService', () => {
  let service: BookingService;
  let bookingService: CreateBookingService;
  let bookingRepository: Repository<Booking>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        LoggerService,
        CreateBookingService,
        {
          provide: getRepositoryToken(Booking),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserProperties),
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
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingService = module.get<CreateBookingService>(CreateBookingService);
    bookingRepository = module.get<Repository<Booking>>(
      getRepositoryToken(Booking),
    );
  });

  describe('getAllBookings', () => {
    it('should return all bookings', async () => {
      const bookings = [{ id: 1 } as Booking, { id: 2 } as Booking];
      jest.spyOn(bookingRepository, 'find').mockResolvedValue(bookings);

      const result = await service.getAllBookings();
      expect(result).toEqual(bookings);
    });

    it('should throw NotFoundException if no bookings found', async () => {
      jest.spyOn(bookingRepository, 'find').mockResolvedValue([]);

      await expect(service.getAllBookings()).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBookingById', () => {
    it('should return a booking by ID', async () => {
      const booking = { id: 1 } as Booking;
      jest
        .spyOn(bookingRepository, 'findOne')
        .mockResolvedValue(booking as Booking);

      const result = await service.getBookingById(1);
      expect(result).toEqual(BOOKING_RESPONSES.BOOKING_FETCHED(booking));
    });

    it('should return BOOKING_NOT_FOUND if booking does not exist', async () => {
      jest.spyOn(bookingRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getBookingById(1);
      expect(result).toEqual(BOOKING_RESPONSES.BOOKING_NOT_FOUND(1));
    });
  });

  describe('updateBooking', () => {
    it('should update a booking', async () => {
      const booking = { id: 1 } as Booking;
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
      const booking = { id: 1 } as Booking;
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
