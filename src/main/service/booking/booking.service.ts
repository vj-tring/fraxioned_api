import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { LoggerService } from 'services/logger.service';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { UpdateBookingDTO } from '../../dto/requests/booking/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly logger: LoggerService,
  ) {}

  async getAllBookings(): Promise<object[]> {
    try {
      const existingProperties = await this.bookingRepository.find({
        relations: ['user', 'property', 'createdBy', 'updatedBy'],
        select: {
          createdBy: {
            id: true,
          },
          updatedBy: {
            id: true,
          },
          user: {
            id: true,
          },
          property: {
            id: true,
          },
        },
      });
      if (existingProperties.length === 0) {
        throw new NotFoundException(`Properties not found`);
      }
      return existingProperties;
    } catch (error) {
      throw error;
    }
  }

  async getBookingById(id: number): Promise<object> {
    this.logger.log(`Fetching booking with ID ${id}`);
    const booking = await this.bookingRepository.findOne({
      relations: ['user', 'property', 'createdBy', 'updatedBy'],
      where: { id },
    });
    if (!booking) {
      this.logger.warn(`Booking with ID ${id} not found`);
      return BOOKING_RESPONSES.BOOKING_NOT_FOUND(id);
    }
    return BOOKING_RESPONSES.BOOKING_FETCHED(booking);
  }

  async getBookingsForUser(userId: number): Promise<object[] | object> {
    this.logger.log(`Fetching bookings for user with ID ${userId}`);
    const bookings = await this.bookingRepository.find({
      relations: ['user', 'property', 'createdBy', 'updatedBy'],
      select: {
        user: { id: true },
        property: { id: true },
        createdBy: { id: true },
        updatedBy: { id: true },
      },
      where: { user: { id: userId } },
    });
    if (bookings.length === 0) {
      this.logger.warn(`No bookings found for user with ID ${userId}`);
      return BOOKING_RESPONSES.BOOKING_FOR_USER_NOT_FOUND(userId);
    }
    return bookings;
  }

  async updateBooking(
    id: number,
    updateBookingDto: UpdateBookingDTO,
  ): Promise<object> {
    this.logger.log(`Updating booking with ID ${id}`);
    const booking = await this.bookingRepository.findOne({ where: { id } });

    if (!booking) {
      this.logger.warn(`Booking with ID ${id} not found`);
      return BOOKING_RESPONSES.BOOKING_NOT_FOUND(id);
    }

    // Update booking details
    Object.assign(booking, updateBookingDto);
    await this.bookingRepository.save(booking);
    return BOOKING_RESPONSES.BOOKING_UPDATED(booking);
  }

  async deleteBooking(id: number): Promise<object> {
    this.logger.log(`Deleting booking with ID ${id}`);
    const booking = await this.bookingRepository.findOne({ where: { id } });

    if (!booking) {
      this.logger.warn(`Booking with ID ${id} not found`);
      return BOOKING_RESPONSES.BOOKING_NOT_FOUND(id);
    }

    await this.bookingRepository.remove(booking);
    return BOOKING_RESPONSES.BOOKING_DELETED(id);
  }
}
