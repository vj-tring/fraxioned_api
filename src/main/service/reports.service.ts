import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingHistory } from '../entities/booking-history.entity';
import { Repository } from 'typeorm';
import { BookingReportDto, ReportFormat } from '../dto/requests/booking-report.dto';
import * as ExcelJS from 'exceljs';
import { PDFDocument } from 'pdfkit';
import { Builder } from 'xml2js';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(BookingHistory)
    private bookingHistoryRepository: Repository<BookingHistory>,
  ) {}

  async getBookingReport(reportDto: BookingReportDto) {
    const { propertyId, userId, fromDate, toDate } = reportDto;
  
    const hasFilters = propertyId || userId || (fromDate && toDate);
  
    if (!hasFilters) {
      throw new Error('At least one filter (propertyId, userId, or date range) must be provided.');
    }
  
    const query = this.bookingHistoryRepository.createQueryBuilder('bookingHistory')
      .leftJoinAndSelect('bookingHistory.user', 'user') 
      .leftJoinAndSelect('bookingHistory.property', 'property') 
      .where('1 = 1');  
  
    if (propertyId) {
      query.andWhere('bookingHistory.property.id = :propertyId', { propertyId });
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
  
    const bookings = await query.getMany();
    return bookings;
  }
  
  
  async generateReport(reportDto: BookingReportDto) {
    const bookings = await this.getBookingReport(reportDto);

    switch (reportDto.format) {
      case ReportFormat.EXCEL:
        return await this.generateExcelReport(bookings);
      case ReportFormat.PDF:
        return await this.generatePdfReport(bookings);
      case ReportFormat.XML:
        return await this.generateXmlReport(bookings);
      default:
        throw new Error('Invalid report format');
    }
  }

  

  private async generatePdfReport(bookings: BookingHistory[]) {
    return new Promise((resolve, reject) => {
      const PDFDocument = require('pdfkit');
  
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
  
      doc.on('data', buffers.push.bind(buffers));
  
      doc.on('end', () => resolve(Buffer.concat(buffers)));
  
      doc.on('error', (err) => {
        console.error('Error during PDF generation:', err);
        reject(err);
      });
  
      doc.fontSize(20).text('Bookings Report', { underline: true });
      doc.moveDown();
  
      if (bookings.length === 0) {
        doc.fontSize(14).text('No bookings available for the selected filters.');
      } else {
        bookings.forEach((booking, index) => {
          doc.fontSize(14).text(`Booking ${index + 1}`, { underline: true });
          doc.text(`Booking ID: ${booking.bookingId}`);
          doc.text(`Property Name: ${booking.property.propertyName}`);
          doc.text(`User Name: ${booking.user.firstName} ${booking.user.lastName}`);
          doc.text(`Check-in Date: ${booking.checkinDate}`);
          doc.text(`Check-out Date: ${booking.checkoutDate}`);
          doc.text(`Updated Date: ${booking.updatedAt}`);
          doc.text(`Canceled Date: ${booking.cancelledAt}`);
          doc.moveDown();
        });
      }
  
      doc.end();
    });
  }
  
  
  

  private async generateExcelReport(bookings: BookingHistory[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Booking Report');

    worksheet.columns = [
        { header: 'Booking ID', key: 'bookingId', width: 30 },
        { header: 'Property Name', key: 'propertyName', width: 30 },
        { header: 'User Name', key: 'userName', width: 30 },
        { header: 'Check-in Date', key: 'checkinDate', width: 20 },
        { header: 'Check-out Date', key: 'checkoutDate', width: 20 },
        { header: 'Updated Date', key: 'updatedAt', width: 20 },
        { header: 'Canceled Date', key: 'canceledAt', width: 20 }
    ];

    bookings.forEach(booking => {
        worksheet.addRow({
            bookingId: booking.bookingId,
            propertyName: booking.property.propertyName, 
            userName: `${booking.user.firstName} ${booking.user.lastName}`, 
            checkinDate: booking.checkinDate,
            checkoutDate: booking.checkoutDate,
            updatedAt: booking.updatedAt,
            canceledAt: booking.cancelledAt
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer; 
}

private async generateXmlReport(bookings: BookingHistory[]) {
  const builder = new Builder();

  if (bookings.length === 0) {
      console.warn('No bookings available for XML report.');
      return '<bookings></bookings>'; 
  }

  const data = {
      bookings: bookings.map((booking) => {
          console.log('Processing booking:', booking);

          return {
              bookingId: booking.bookingId,
              propertyName: booking.property.propertyName,
              userName: `${booking.user.firstName} ${booking.user.lastName}`, 
              checkinDate: booking.checkinDate ? booking.checkinDate.toISOString() : null, 
              checkoutDate: booking.checkoutDate ? booking.checkoutDate.toISOString() : null, 
              updatedAt: booking.updatedAt ? booking.updatedAt.toISOString() : null, 
              canceledAt: booking.cancelledAt ? booking.cancelledAt.toISOString() : null 
          };
      }),
  };

  const xml = builder.buildObject(data);
  return xml;
}


  
}
