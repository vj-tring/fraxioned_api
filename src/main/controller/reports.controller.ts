import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ReportsService } from '../service/reports.service';
import {
  BookingReportDto,
  ReportFormat,
} from '../dto/requests/booking-report.dto';
import { AuthGuard } from '../commons/guards/auth.guard';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('v1/bookings-report')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async getBookingReport(
    @Body() reportDto: BookingReportDto,
    @Res() res: Response,
    @Headers('user-id') userId: string,
    @Headers('access-token') accessToken: string,
  ): Promise<Response> {
    if (!userId || !accessToken) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .send('User ID and access token must be provided.');
    }

    const hasFilters =
      reportDto.propertyId ||
      reportDto.userId ||
      (reportDto.fromDate && reportDto.toDate);

    if (!hasFilters) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          'At least one filter (propertyId, userId, or date range) must be provided.',
        );
    }

    const reportBuffer = await this.reportsService.generateReport(reportDto);

    switch (reportDto.format) {
      case ReportFormat.EXCEL:
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=report.xlsx',
        );
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        return res.send(reportBuffer);
      case ReportFormat.PDF:
        res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        return res.send(reportBuffer);
      case ReportFormat.XML:
        res.setHeader('Content-Disposition', 'attachment; filename=report.xml');
        res.setHeader('Content-Type', 'application/xml');
        return res.send(reportBuffer);
      default:
        return res.status(HttpStatus.BAD_REQUEST).send('Invalid format');
    }
  }
}
