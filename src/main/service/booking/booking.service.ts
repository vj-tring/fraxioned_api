import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { LoggerService } from 'services/logger.service';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { UpdateBookingDTO } from '../../dto/requests/booking/update-booking.dto';
import { User } from 'src/main/entities/user.entity';

const paradiseProperty = 'Paradise Shores';
@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: LoggerService,
  ) {}

  private async setPropertyName(
    booking: Booking,
    requestedUser: number,
  ): Promise<Booking> {
    const shouldApplyFilter =
      await this.shouldApplyPropertyNameFilter(requestedUser);
    if (
      shouldApplyFilter &&
      (booking.property.id === 1 || booking.property.id === 2)
    ) {
      booking.property.propertyName = paradiseProperty;
    }
    return booking;
  }

  private async shouldApplyPropertyNameFilter(
    userId: number,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
      select: { role: { id: true } },
    });
    return user?.role.id !== 1;
  }

  async getAllBookings(requestedUser: number): Promise<object[] | object> {
    try {
      const existingBookings = await this.bookingRepository.find({
        relations: ['user', 'property', 'createdBy', 'updatedBy'],
        select: {
          createdBy: { id: true },
          updatedBy: { id: true },
          user: { id: true },
          property: { id: true, propertyName: true },
        },
      });
      if (existingBookings.length === 0) {
        return BOOKING_RESPONSES.BOOKINGS_NOT_FOUND();
      }
      return Promise.all(
        existingBookings.map((booking) =>
          this.setPropertyName(booking, requestedUser),
        ),
      );
    } catch (error) {
      throw error;
    }
  }

  async getBookingById(id: number, requestedUser: number): Promise<object> {
    this.logger.log(`Fetching booking with ID ${id}`);
    const booking = await this.bookingRepository.findOne({
      relations: ['user', 'property', 'createdBy', 'updatedBy'],
      select: {
        user: { id: true },
        property: { id: true, propertyName: true },
        createdBy: { id: true },
        updatedBy: { id: true },
      },
      where: { id },
    });
    if (!booking) {
      this.logger.warn(`Booking with ID ${id} not found`);
      return BOOKING_RESPONSES.BOOKING_NOT_FOUND(id);
    }
    return this.setPropertyName(booking, requestedUser);
  }

  async getBookingsForUser(
    userId: number,
    requestedUser: number,
  ): Promise<object[] | object> {
    this.logger.log(`Fetching bookings for user with ID ${userId}`);
    const bookings = await this.bookingRepository.find({
      relations: ['user', 'property', 'createdBy', 'updatedBy'],
      select: {
        user: { id: true },
        property: { id: true, propertyName: true },
        createdBy: { id: true },
        updatedBy: { id: true },
      },
      where: { user: { id: userId } },
    });
    if (bookings.length === 0) {
      this.logger.warn(`No bookings found for user with ID ${userId}`);
      return BOOKING_RESPONSES.BOOKING_FOR_USER_NOT_FOUND(userId);
    }
    return Promise.all(
      bookings.map((booking) => this.setPropertyName(booking, requestedUser)),
    );
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
