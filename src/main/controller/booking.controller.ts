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
import { CreateBookingDTO } from 'src/main/dto/requests/booking/create-booking.dto';
import { UpdateBookingDTO } from '../dto/requests/booking/update-booking.dto';
import { CreateBookingService } from '../service/booking/create-booking.service';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { AuthGuard } from '../commons/guards/auth.guard';
import { AdminBookingService } from '../service/booking/admin-booking.service';
import { CancelBookingService } from '../service/booking/booking-cancel.service';
import { BookingSummaryService } from '../service/booking/booking-summary.service';
import { UpdateBookingService } from '../service/booking/booking-update.service';
import { BookingService } from '../service/booking/booking.service';

@ApiTags('Booking')
@Controller('v1/bookings')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly createBookingService: CreateBookingService,
    private readonly adminBookingService: AdminBookingService,
    private readonly bookingSummaryService: BookingSummaryService,
    private readonly updateBookingService: UpdateBookingService,
    private readonly cancelBookingService: CancelBookingService,
  ) {}

  private getUserIdFromRequest(req: Request): number {
    const userId = req.headers['user-id'];
    return userId ? parseInt(userId as string, 10) : 0;
  }

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

  @Post('admin-booking')
  async adminBooking(
    @Body() createBookingDto: CreateBookingDTO,
  ): Promise<object> {
    return this.adminBookingService.createAdminBooking(createBookingDto);
  }
}
