import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingService } from 'src/main/service/booking.service';
import { CreateBookingDTO } from 'src/main/dto/requests/booking/create-booking.dto';
import { UpdateBookingDTO } from '../dto/requests/booking/update-booking.dto';

@ApiTags('Booking')
@Controller('v1/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('booking')
  async createBooking(
    @Body() createBookingDto: CreateBookingDTO,
  ): Promise<object> {
    return this.bookingService.createBooking(createBookingDto);
  }

  @Get()
  async getAllBookings(): Promise<object[]> {
    try {
      return await this.bookingService.getAllBookings();
    } catch (error) {
      throw error;
    }
  }

  @Get('booking/:id')
  async getBookingById(@Param('id') id: number): Promise<object> {
    return this.bookingService.getBookingById(id);
  }

  @Patch('booking/:id')
  async updateBooking(
    @Param('id') id: number,
    @Body() updateBookingDto: UpdateBookingDTO,
  ): Promise<object> {
    return this.bookingService.updateBooking(id, updateBookingDto);
  }

  @Delete('booking/:id')
  async deleteBooking(@Param('id') id: number): Promise<object> {
    return this.bookingService.deleteBooking(id);
  }
}