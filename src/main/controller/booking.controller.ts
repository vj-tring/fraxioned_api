import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingService } from 'src/main/service/booking/booking.service';
import { CreateBookingDTO } from 'src/main/dto/requests/booking/create-booking.dto';
import { UpdateBookingDTO } from '../dto/requests/booking/update-booking.dto';
import { CreateBookingService } from '../service/booking/create-booking.service';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { AuthGuard } from '../commons/guards/auth.guard';
import { BookingSummaryService } from '../service/booking/booking-summary.service';
import { UpdateBookingService } from '../service/booking/booking-update.service';
import { CancelBookingService } from '../service/booking/booking-cancel.service';

@ApiTags('Booking')
@Controller('v1/bookings')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly createBookingService: CreateBookingService,
    private readonly bookingSummaryService: BookingSummaryService,
    private readonly updateBookingService: UpdateBookingService,
    private readonly cancelBookingService: CancelBookingService,
  ) {}

  @Post('booking')
  async createBooking(
    @Body() createBookingDto: CreateBookingDTO,
  ): Promise<object> {
    return this.createBookingService.createBooking(createBookingDto);
  }

  @Post('booking/booking-summary')
  async bookingSummary(
    @Body() createBookingDto: CreateBookingDTO,
  ): Promise<object> {
    return this.bookingSummaryService.bookingSummary(createBookingDto);
  }

  private getUserIdFromRequest(req: Request): number {
    const userId = req.headers['user-id'];
    return userId ? parseInt(userId as string, 10) : 0;
  }

  @Get()
  async getAllBookings(@Req() req: Request): Promise<object[] | object> {
    try {
      const requestedUser = this.getUserIdFromRequest(req);
      return await this.bookingService.getAllBookings(requestedUser);
    } catch (error) {
      throw error;
    }
  }

  @Get('booking/:id')
  async getBookingById(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<object> {
    const requestedUser = this.getUserIdFromRequest(req);
    return this.bookingService.getBookingById(id, requestedUser);
  }

  @Get('user/:userId')
  async getBookingsForUser(
    @Param('userId') userId: number,
    @Req() req: Request,
  ): Promise<object[] | object> {
    try {
      const requestedUser = this.getUserIdFromRequest(req);
      return await this.bookingService.getBookingsForUser(
        userId,
        requestedUser,
      );
    } catch (error) {
      throw error;
    }
  }

  @Patch('booking/:id')
  async updateBooking(
    @Param('id') id: number,
    @Body() updateBookingDto: UpdateBookingDTO,
  ): Promise<object> {
    return this.updateBookingService.updateBooking(id, updateBookingDto);
  }

  @Delete('booking/:id')
  async deleteBooking(@Param('id') id: number): Promise<object> {
    return this.bookingService.deleteBooking(id);
  }

  @Post(':id/:user/cancel')
  async cancelBooking(
    @Param('id') id: number,
    @Param('user') user: number,
  ): Promise<object> {
    return this.cancelBookingService.cancelBooking(id, user);
  }
}
