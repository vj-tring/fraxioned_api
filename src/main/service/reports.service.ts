import { InjectRepository } from '@nestjs/typeorm';
import { BookingHistory } from '../entities/booking-history.entity';
import { UserProperties } from '../entities/user-properties.entity';
import { Repository } from 'typeorm';
import {
  BookingReportDto,
  ReportFormat,
} from '../dto/requests/booking-report.dto';
import * as ExcelJS from 'exceljs';
import { Builder } from 'xml2js';
import { Buffer } from 'buffer';

interface RowData {
  bookingId: string;
  propertyName: string;
  ownerName: string;
  checkinDate: Date;
  checkoutDate: Date;
  updatedAt: Date;
  canceledAt?: Date;
}
interface BookingData {
  bookingId: string;
  propertyName: string;
  userName: string;
  checkinDate: string | null;
  checkoutDate: string | null;
  updatedAt: string | null;
  canceledAt: string | null;
  sharesOwned?: number;
  psrn?: number;
  osrn?: number;
  osrhn?: number;
  psbn?: number;
  psun?: number;
  acquisitionDate?: string | null;
  isActive?: boolean;
  year?: number | null;
  peakAllottedNights?: number | null;
  peakCancelledNights?: number;
  peakLostNights?: number;
  peakAllottedHolidayNights?: number | null;
  peakUsedHolidayNights?: number;
  peakBookedHolidayNights?: number;
  peakRemainingHolidayNights?: number;
  peakCancelledHolidayNights?: number | null;
  peakLostHolidayNights?: number | null;
  offAllottedNights?: number | null;
  offCancelledNights?: number;
  offLostNights?: number;
  offAllottedHolidayNights?: number | null;
  offUsedHolidayNights?: number;
  offBookedHolidayNights?: number;
  offRemainingHolidayNights?: number;
  offCancelledHolidayNights?: number | null;
  offLostHolidayNights?: number | null;
  lastMinuteAllottedNights?: number | null;
  lastMinuteUsedNights?: number | null;
  lastMinuteBookedNights?: number | null;
  lastMinuteRemainingNights?: number | null;
  maximumStayLength?: number | null;
}

export class ReportsService {
  constructor(
    @InjectRepository(BookingHistory)
    private bookingHistoryRepository: Repository<BookingHistory>,

    @InjectRepository(UserProperties)
    private userPropertiesRepository: Repository<UserProperties>,
  ) {}

  async getBookingReport(
    reportDto: BookingReportDto,
  ): Promise<BookingHistory[]> {
    const {
      propertyId,
      userId,
      fromDate,
      toDate,
      isCancelled,
      isLastminBooking,
      ismodifiedBooking,
      isCompleted,
      withPets,
    } = reportDto;

    const hasPropertyOrUserFilter = propertyId || userId;
    const hasDateRange = fromDate && toDate;

    if (!hasPropertyOrUserFilter && !hasDateRange) {
      throw new Error(
        'At least one of the following filters must be provided: propertyId & userId or date range.',
      );
    }

    const query = this.bookingHistoryRepository
      .createQueryBuilder('bookingHistory')
      .leftJoinAndSelect('bookingHistory.user', 'user')
      .leftJoinAndSelect('bookingHistory.property', 'property')
      .where('1 = 1');

    if (propertyId) {
      query.andWhere('bookingHistory.property.id = :propertyId', {
        propertyId,
      });
    }

    if (userId) {
      query.andWhere('bookingHistory.user.id = :userId', { userId });
    }

    if (fromDate) {
      query.andWhere('bookingHistory.checkinDate >= :fromDate', { fromDate });
    }

    if (toDate) {
      query.andWhere('bookingHistory.checkoutDate <= :toDate', { toDate });
    }

    if (isCancelled !== undefined) {
      query.andWhere('bookingHistory.is_cancelled = :isCancelled', {
        isCancelled,
      });
    }

    if (isLastminBooking !== undefined) {
      query.andWhere(
        'bookingHistory.is_last_minute_booking = :isLastminBooking',
        { isLastminBooking },
      );
    }

    if (ismodifiedBooking !== undefined) {
      query.andWhere(
        ismodifiedBooking
          ? 'bookingHistory.modified_by > 0'
          : 'bookingHistory.modified_by = 0',
      );
    }

    if (isCompleted !== undefined) {
      query.andWhere('bookingHistory.isCompleted = :isCompleted', {
        isCompleted,
      });
    }

    if (withPets !== undefined) {
      query.andWhere(
        withPets
          ? 'bookingHistory.no_of_pets > 0'
          : 'bookingHistory.no_of_pets = 0',
      );
    }

    const bookings = await query.getMany();
    return bookings;
  }

  async generateReport(reportDto: BookingReportDto): Promise<Buffer> {
    const bookings = await this.getBookingReport(reportDto);
    const content = reportDto.content;

    switch (reportDto.format) {
      case ReportFormat.EXCEL:
        return await this.generateExcelReport(bookings, content);
      case ReportFormat.PDF:
        return await this.generatePdfReport(bookings, content);
      case ReportFormat.XML:
        return await this.generateXmlReport(bookings, content);
      default:
        throw new Error('Invalid report format');
    }
  }

  private async generateExcelReport(
    bookings: BookingHistory[],
    content: string,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Booking Report');

    if (content === 'alldetails') {
      worksheet.columns = [
        { header: 'Booking ID', key: 'bookingId', width: 30 },
        { header: 'Property Name', key: 'propertyName', width: 30 },
        { header: 'Owner Name', key: 'ownerName', width: 30 },
        { header: 'Check-in Date', key: 'checkinDate', width: 20 },
        { header: 'Check-out Date', key: 'checkoutDate', width: 20 },
        { header: 'Updated Date', key: 'updatedAt', width: 20 },
        { header: 'Canceled Date', key: 'canceledAt', width: 20 },
        { header: 'Shares Owned', key: 'sharesOwned', width: 20 },
        { header: 'PSRN', key: 'psrn', width: 20 },
        { header: 'PSUN', key: 'psun', width: 20 },
        { header: 'PSBN', key: 'psbn', width: 20 },
        { header: 'PSCN', key: 'pscn', width: 20 },
        { header: 'PSLN', key: 'psln', width: 20 },
        { header: 'PSAHN', key: 'psahn', width: 20 },
        { header: 'PSUHN', key: 'psuhn', width: 20 },
        { header: 'PSBHN', key: 'psbhn', width: 20 },
        { header: 'PSRHN', key: 'psrhn', width: 20 },
        { header: 'PSCHN', key: 'pschn', width: 20 },
        { header: 'OSAN', key: 'osan', width: 20 },
        { header: 'OSUN', key: 'osun', width: 20 },
        { header: 'OSBN', key: 'osbn', width: 20 },
        { header: 'OSCN', key: 'oscn', width: 20 },
        { header: 'OSLN', key: 'osln', width: 20 },
        { header: 'OSRN', key: 'osrn', width: 20 },
        { header: 'OSAHN', key: 'osahn', width: 20 },
        { header: 'OSUHN', key: 'osuhn', width: 20 },
        { header: 'OSBHN', key: 'osbhn', width: 20 },
        { header: 'OSRHN', key: 'osrhn', width: 20 },
        { header: 'OSCHN', key: 'oschn', width: 20 },
        { header: 'OSLHN', key: 'oslhn', width: 20 },
        { header: 'LMBAHN', key: 'lmban', width: 20 },
        { header: 'LMUBN', key: 'lmbun', width: 20 },
        { header: 'LMBBN', key: 'lmbbn', width: 20 },
        { header: 'LMBRN', key: 'lmbrn', width: 20 },
        { header: 'Max Stay Length', key: 'msl', width: 20 },
      ];
    } else {
      worksheet.columns = [
        { header: 'Booking ID', key: 'bookingId', width: 30 },
        { header: 'Property Name', key: 'propertyName', width: 30 },
        { header: 'Owner Name', key: 'ownerName', width: 30 },
        { header: 'Check-in Date', key: 'checkinDate', width: 20 },
        { header: 'Check-out Date', key: 'checkoutDate', width: 20 },
        { header: 'Updated Date', key: 'updatedAt', width: 20 },
        { header: 'Canceled Date', key: 'canceledAt', width: 20 },
      ];
    }

    for (const booking of bookings) {
      const rowData: RowData = {
        bookingId: booking.bookingId,
        propertyName: booking.property.propertyName,
        ownerName: `${booking.user.firstName} ${booking.user.lastName}`,
        checkinDate: booking.checkinDate,
        checkoutDate: booking.checkoutDate,
        updatedAt: booking.updatedAt,
        canceledAt: booking.cancelledAt,
      };

      if (content === 'alldetails') {
        const userProperties = await this.userPropertiesRepository.findOne({
          where: {
            user: { id: booking.user.id },
            property: { id: booking.property.id },
          },
        });
        Object.assign(rowData, {
          sharesOwned: userProperties?.noOfShare || 0,
          psrn: userProperties?.peakRemainingNights || 0,
          psun: userProperties?.peakUsedNights || 0,
          psbn: userProperties?.peakBookedNights || 0,
          pscn: userProperties?.peakCancelledNights || 0,
          psln: userProperties?.peakLostNights || 0,
          psahn: userProperties?.peakAllottedHolidayNights || 0,
          psuhn: userProperties?.peakUsedHolidayNights || 0,
          psbhn: userProperties?.peakBookedHolidayNights || 0,
          psrhn: userProperties?.peakRemainingHolidayNights || 0,
          pschn: userProperties?.peakCancelledHolidayNights || 0,
          osan: userProperties?.offAllottedNights || 0,
          osun: userProperties?.offUsedNights || 0,
          osbn: userProperties?.offBookedNights || 0,
          oscn: userProperties?.offCancelledNights || 0,
          osln: userProperties?.offLostNights || 0,
          osrn: userProperties?.offRemainingNights || 0,
          osahn: userProperties?.offAllottedHolidayNights || 0,
          osuahn: userProperties?.offUsedHolidayNights || 0,
          osbhn: userProperties?.offBookedHolidayNights || 0,
          osrhn: userProperties?.offRemainingHolidayNights || 0,
          oschn: userProperties?.offCancelledHolidayNights || 0,
          oslhn: userProperties?.offLostHolidayNights || 0,
          lmban: userProperties?.lastMinuteAllottedNights || 0,
          lmbun: userProperties?.lastMinuteUsedNights || 0,
          lmbbn: userProperties?.lastMinuteBookedNights || 0,
          lmbrn: userProperties?.lastMinuteRemainingNights || 0,
          msl: userProperties?.maximumStayLength || 0,
        });
      }

      worksheet.addRow(rowData);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
  }

  private async generateXmlReport(
    bookings: BookingHistory[],
    content: string,
  ): Promise<Buffer> {
    const builder = new Builder();

    if (bookings.length === 0) {
      console.warn('No bookings available for XML report.');
      return Buffer.from('<bookings></bookings>');
    }

    const bookingsData = await Promise.all(
      bookings.map(async (booking) => {
        const bookingData: BookingData = {
          bookingId: booking.bookingId,
          propertyName: booking.property.propertyName,
          userName: `${booking.user.firstName} ${booking.user.lastName}`,
          checkinDate: booking.checkinDate
            ? booking.checkinDate.toISOString()
            : null,
          checkoutDate: booking.checkoutDate
            ? booking.checkoutDate.toISOString()
            : null,
          updatedAt: booking.updatedAt ? booking.updatedAt.toISOString() : null,
          canceledAt: booking.cancelledAt
            ? booking.cancelledAt.toISOString()
            : null,
        };

        if (content === 'alldetails') {
          const userProperties = await this.userPropertiesRepository.findOne({
            where: {
              user: { id: booking.user.id },
              property: { id: booking.property.id },
            },
          });

          bookingData.sharesOwned = userProperties?.noOfShare || 0;
          bookingData.psrn = userProperties?.peakRemainingNights || 0;
          bookingData.osrn = userProperties?.offRemainingNights || 0;
          bookingData.osrhn = userProperties?.offRemainingHolidayNights || 0;
          bookingData.psbn = userProperties?.peakBookedNights || 0;
          bookingData.psun = userProperties?.peakUsedNights || 0;

          bookingData.acquisitionDate =
            userProperties?.acquisitionDate?.toISOString() || null;
          bookingData.isActive = userProperties?.isActive || false;
          bookingData.year = userProperties?.year || null;
          bookingData.peakAllottedNights =
            userProperties?.peakAllottedNights || null;
          bookingData.peakCancelledNights =
            userProperties?.peakCancelledNights || 0;
          bookingData.peakLostNights = userProperties?.peakLostNights || 0;
          bookingData.peakAllottedHolidayNights =
            userProperties?.peakAllottedHolidayNights || null;
          bookingData.peakUsedHolidayNights =
            userProperties?.peakUsedHolidayNights || 0;
          bookingData.peakBookedHolidayNights =
            userProperties?.peakBookedHolidayNights || 0;
          bookingData.peakRemainingHolidayNights =
            userProperties?.peakRemainingHolidayNights || 0;
          bookingData.peakCancelledHolidayNights =
            userProperties?.peakCancelledHolidayNights || null;
          bookingData.peakLostHolidayNights =
            userProperties?.peakLostHolidayNights || null;
          bookingData.offAllottedNights =
            userProperties?.offAllottedNights || null;
          bookingData.offCancelledNights =
            userProperties?.offCancelledNights || 0;
          bookingData.offLostNights = userProperties?.offLostNights || 0;
          bookingData.offAllottedHolidayNights =
            userProperties?.offAllottedHolidayNights || null;
          bookingData.offUsedHolidayNights =
            userProperties?.offUsedHolidayNights || 0;
          bookingData.offBookedHolidayNights =
            userProperties?.offBookedHolidayNights || 0;
          bookingData.offRemainingHolidayNights =
            userProperties?.offRemainingHolidayNights || 0;
          bookingData.offCancelledHolidayNights =
            userProperties?.offCancelledHolidayNights || null;
          bookingData.offLostHolidayNights =
            userProperties?.offLostHolidayNights || null;
          bookingData.lastMinuteAllottedNights =
            userProperties?.lastMinuteAllottedNights || null;
          bookingData.lastMinuteUsedNights =
            userProperties?.lastMinuteUsedNights || null;
          bookingData.lastMinuteBookedNights =
            userProperties?.lastMinuteBookedNights || null;
          bookingData.lastMinuteRemainingNights =
            userProperties?.lastMinuteRemainingNights || null;
          bookingData.maximumStayLength =
            userProperties?.maximumStayLength || null;
        }

        return bookingData;
      }),
    );

    const data = { bookings: bookingsData };
    const xml = builder.buildObject(data);
    return Buffer.from(xml);
  }

  private async generatePdfReport(
    bookings: BookingHistory[],
    content: string,
  ): Promise<Buffer> {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    return new Promise<Buffer>(async (resolve, reject) => {
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      doc
        .fontSize(24)
        .text('Bookings Report', { underline: true, align: 'center' });
      doc.moveDown(2);

      if (bookings.length === 0) {
        doc.fontSize(14).text('No bookings found for the specified criteria.', {
          align: 'center',
        });
        doc.end();
        return;
      }

      const propertyDetailsMap: {
        [key: number]: {
          peakRemainingNights: number;
          offRemainingNights: number;
        };
      } = {};

      for (const booking of bookings) {
        doc.moveDown();
        doc.fontSize(16).text('Booking Details:', { underline: true });
        doc.fontSize(12);
        doc.text(`Booking ID: ${booking.bookingId}`);
        doc.text(`Property: ${booking.property.propertyName}`);
        doc.text(`User: ${booking.user.firstName} ${booking.user.lastName}`);
        doc.text(
          `Check-in: ${booking.checkinDate.toString().split(' GMT')[0]}`,
        );
        doc.text(
          `Check-out: ${booking.checkoutDate.toString().split(' GMT')[0]}`,
        );
        doc.moveDown();

        if (content === 'alldetails') {
          const userProperties = await this.userPropertiesRepository.findOne({
            where: {
              user: { id: booking.user.id },
              property: { id: booking.property.id },
            },
          });

          if (userProperties) {
            doc
              .fontSize(14)
              .text('Details based on Owner:', { underline: true });
            doc.fontSize(12);
            doc.text(`Shares Owned: ${userProperties.noOfShare}`);
            doc.text(`Acquisition Date: ${userProperties.acquisitionDate}`);
            doc.text(`Is Active: ${userProperties.isActive}`);
            doc.text(`Year: ${userProperties.year || 'N/A'}`);
            doc.text(
              `Peak Allotted Nights: ${userProperties.peakAllottedNights || 0}`,
            );
            doc.text(`Peak Used Nights: ${userProperties.peakUsedNights || 0}`);
            doc.text(
              `Peak Booked Nights: ${userProperties.peakBookedNights || 0}`,
            );
            doc.text(
              `Peak Cancelled Nights: ${userProperties.peakCancelledNights || 0}`,
            );
            doc.text(`Peak Lost Nights: ${userProperties.peakLostNights || 0}`);
            doc.text(
              `Peak Remaining Nights: ${userProperties.peakRemainingNights || 0}`,
            );
            doc.text(
              `Peak Allotted Holiday Nights: ${userProperties.peakAllottedHolidayNights || 0}`,
            );
            doc.text(
              `Peak Used Holiday Nights: ${userProperties.peakUsedHolidayNights || 0}`,
            );
            doc.text(
              `Peak Booked Holiday Nights: ${userProperties.peakBookedHolidayNights || 0}`,
            );
            doc.text(
              `Peak Cancelled Holiday Nights: ${userProperties.peakCancelledHolidayNights || 0}`,
            );
            doc.text(
              `Peak Lost Holiday Nights: ${userProperties.peakLostHolidayNights || 0}`,
            );
            doc.text(
              `Peak Remaining Holiday Nights: ${userProperties.peakRemainingHolidayNights || 0}`,
            );
            doc.text(
              `Off Allotted Nights: ${userProperties.offAllottedNights || 0}`,
            );
            doc.text(`Off Used Nights: ${userProperties.offUsedNights || 0}`);
            doc.text(
              `Off Booked Nights: ${userProperties.offBookedNights || 0}`,
            );
            doc.text(
              `Off Cancelled Nights: ${userProperties.offCancelledNights || 0}`,
            );
            doc.text(`Off Lost Nights: ${userProperties.offLostNights || 0}`);
            doc.text(
              `Off Remaining Nights: ${userProperties.offRemainingNights || 0}`,
            );
            doc.text(
              `Off Allotted Holiday Nights: ${userProperties.offAllottedHolidayNights || 0}`,
            );
            doc.text(
              `Off Used Holiday Nights: ${userProperties.offUsedHolidayNights || 0}`,
            );
            doc.text(
              `Off Booked Holiday Nights: ${userProperties.offBookedHolidayNights || 0}`,
            );
            doc.text(
              `Off Cancelled Holiday Nights: ${userProperties.offCancelledHolidayNights || 0}`,
            );
            doc.text(
              `Off Lost Holiday Nights: ${userProperties.offLostHolidayNights || 0}`,
            );
            doc.text(
              `Last Minute Allotted Nights: ${userProperties.lastMinuteAllottedNights || 0}`,
            );
            doc.text(
              `Last Minute Used Nights: ${userProperties.lastMinuteUsedNights || 0}`,
            );
            doc.text(
              `Last Minute Booked Nights: ${userProperties.lastMinuteBookedNights || 0}`,
            );
            doc.text(
              `Last Minute Remaining Nights: ${userProperties.lastMinuteRemainingNights || 0}`,
            );
            doc.text(
              `Maximum Stay Length: ${userProperties.maximumStayLength || 'N/A'}`,
            );
            doc.text(`Created By: ${userProperties.createdBy?.id || 'N/A'}`);
            doc.text(`Updated By: ${userProperties.updatedBy?.id || 'N/A'}`);
            doc.text(`Created At: ${userProperties.createdAt}`);
            doc.text(`Updated At: ${userProperties.updatedAt}`);
            doc.moveDown();
          }
        }

        const peakAllottedNightsMap = {
          1: 15 * 8,
          2: 7 * 10,
          3: 15 * 8,
          4: 7 * 8,
          5: 7 * 8,
          6: 15 * 8,
          7: 15 * 8,
          8: 15 * 8,
        };

        const offAllottedNightsMap = {
          1: 30 * 8,
          2: 30 * 10,
          3: 30 * 8,
          4: 21 * 8,
          5: 21 * 8,
          6: 30 * 8,
          7: 30 * 8,
          8: 30 * 8,
        };

        const propertyId = booking.property.id;
        const peakAllottedNights = peakAllottedNightsMap[propertyId] || 0;
        const offAllottedNights = offAllottedNightsMap[propertyId] || 0;

        if (!propertyDetailsMap[propertyId]) {
          propertyDetailsMap[propertyId] = {
            peakRemainingNights: peakAllottedNights,
            offRemainingNights: offAllottedNights,
          };
        }

        const userProperties = await this.userPropertiesRepository.findOne({
          where: {
            user: { id: booking.user.id },
            property: { id: propertyId },
          },
        });

        if (userProperties) {
          propertyDetailsMap[propertyId].peakRemainingNights -=
            userProperties.peakUsedNights || 0;
          propertyDetailsMap[propertyId].offRemainingNights -=
            userProperties.offUsedNights || 0;
        }
      }

      doc
        .fontSize(14)
        .text('Details based on Properties:', { underline: true });
      doc.moveDown();

      doc.fontSize(12);

      for (const propertyId in propertyDetailsMap) {
        const propertyName =
          bookings.find((b) => b.property.id.toString() === propertyId)
            ?.property.propertyName || 'Unknown Property';
        const { peakRemainingNights, offRemainingNights } =
          propertyDetailsMap[propertyId];

        doc.text(`Property Name: ${propertyName}`);
        doc.text(`Peak Season Remaining Nights: ${peakRemainingNights}`);
        doc.text(`Off Season Remaining Nights: ${offRemainingNights}`);
        doc.moveDown();
      }

      doc.end();
    });
  }
}
