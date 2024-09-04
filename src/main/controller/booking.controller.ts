import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingService } from 'src/main/service/booking/booking.service';
import { CreateBookingDTO } from 'src/main/dto/requests/booking/create-booking.dto';
import { UpdateBookingDTO } from '../dto/requests/booking/update-booking.dto';
import { CreateBookingService } from '../service/booking/create-booking.service';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { AuthGuard } from '../commons/guards/auth.guard';

@ApiTags('Booking')
@Controller('v1/bookings')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly createBookingService: CreateBookingService,
  ) {}

  @Post('booking')
  async createBooking(
    @Body() createBookingDto: CreateBookingDTO,
  ): Promise<object> {
    return this.createBookingService.createBooking(createBookingDto);
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

  @Get('user/:userId')
  async getBookingsForUser(
    @Param('userId') userId: number,
  ): Promise<object[] | object> {
    try {
      return await this.bookingService.getBookingsForUser(userId);
    } catch (error) {
      throw error;
    }
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
