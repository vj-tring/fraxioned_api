import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingService } from 'src/main/service/booking.service';
import { CreateBookingDTO } from 'src/main/dto/requests/booking/create-booking.dto';

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
}
