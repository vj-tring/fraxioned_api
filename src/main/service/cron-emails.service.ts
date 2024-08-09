import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MailService } from './mail.service';

@Injectable()
export class CronEmailsService {
  private readonly logger = new Logger(CronEmailsService.name);

  constructor(
    private readonly mailService: MailService,
    // private readonly bookingService: BookingService, // Inject your booking service
  ) {}

  @Cron('0 28 17 * * *')
  async sendBookingReminder(): Promise<void> {
    this.logger.debug('Sending booking reminder emails');

    // Fetch upcoming bookings (this is just a placeholder logic)
    // Replace with your actual booking fetching logic
    // const upcomingBookings = await this.bookingService.getUpcomingBookings();

    // the logic for multiple users --> fetch the records that have check in date = today +14 days(2 weeks)
    const upcomingBookings = [
      {
        user: 'divyashri.srinivasadevan@tringapps.net',
        username: 'Divyashri',
        propertyName: 'The Crown Jewel',
        checkInDate: new Date(),
        propertyAddress:
          '5409 South Aquamarine Lane, St. George, Utah, United States, 84790',
        bookingId: '123456',
      },
    ];

    for (const booking of upcomingBookings) {
      const emailText = `
        Hello ${booking.username},

        We hope you are excited for your upcoming stay at ${booking.propertyName}! Please be sure to read the rest of this email, as codes and rules may have changed since your last stay.

        As a reminder, the home address is ${booking.propertyAddress}

        Your check-in date is ${booking.checkInDate.toDateString()}.

        Booking ID: ${booking.bookingId}

        We look forward to hosting you!

        Best regards,
        Fraxioned Team
      `;

      try {
        await this.mailService.sendMail(
          booking.user,
          'Upcoming Booking Reminder',
          emailText,
        );
        this.logger.log(`Reminder sent for booking ID ${booking.bookingId}`);
      } catch (error) {
        this.logger.error(
          `Failed to send reminder for booking ID ${booking.bookingId}`,
          error.stack,
        );
      }
    }
  }
}
