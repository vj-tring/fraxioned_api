import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Equal, Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { LoggerService } from 'services/logger.service';
import {
  mailSubject,
  mailTemplates,
  ReminderType,
  SignWaiverRequiredProperties,
} from 'src/main/commons/constants/email/mail.constants';
import { MailService } from 'src/main/email/mail.service';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { User } from 'src/main/entities/user.entity';
import { format } from 'date-fns';
import { authConstants } from 'src/main/commons/constants/authentication/authentication.constants';
import { BookingUtilService } from './booking.service.util';
import { Property } from 'src/main/entities/property.entity';
import { PropertyCodes } from 'src/main/entities/property-codes.entity';

@Injectable()
export class BookingMailService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(UserContactDetails)
    private readonly userContactDetailsRepository: Repository<UserContactDetails>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(PropertyCodes)
    private readonly propertyCodesRepository: Repository<PropertyCodes>,
    private readonly logger: LoggerService,
    private readonly mailService: MailService,
    private readonly bookingUtilService: BookingUtilService,
  ) {}

  private async getScheduledDate(
    reminderDays: number,
    hour: number = 0,
  ): Promise<{
    scheduledDate: Date;
    startOfDay: Date;
    endOfDay: Date;
  }> {
    const scheduledDate = new Date(Date.now());
    scheduledDate.setDate(scheduledDate.getDate() + Math.abs(reminderDays));
    scheduledDate.setHours(hour, 0, 0, 0);

    const startOfDay = new Date(scheduledDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(scheduledDate);
    endOfDay.setHours(23, 59, 59, 999);

    return { scheduledDate, startOfDay, endOfDay };
  }

  private async getBannerImage(booking: Booking): Promise<string> {
    let imageUrl = '';
    const property = await this.propertyRepository.findOne({
      where: {
        id: booking.property.id,
      },
    });

    if (property) {
      imageUrl = property.mailBannerUrl;
      this.logger.log(`Banner Image URL: ${imageUrl}`);
    } else {
      this.logger.warn(
        `No banner image found for property ID: ${booking.property.id}`,
      );
    }

    return imageUrl;
  }

  private async getPrimaryEmail(booking: Booking): Promise<string> {
    const contacts = await this.userContactDetailsRepository.find({
      where: { user: { id: booking.user.id } },
      select: ['primaryEmail'],
    });

    if (contacts || contacts.length !== 0) {
      const { primaryEmail: email } = contacts[0];
      return email;
    }

    return;
  }

  private async getPropertyCodes(id: number): Promise<object> {
    const codesObject = new Object();
    (
      await this.propertyCodesRepository.find({
        where: { property: { id } },
        relations: ['propertyCodeCategory'],
      })
    ).map((code) => {
      codesObject[code.propertyCodeCategory.name] = code.propertyCode;
    });
    return codesObject;
  }

  private async createEmailContext(
    booking: Booking,
    property: Property,
    user: User,
    imageUrl: string = '',
    lastCheckInDate: Date = undefined,
    lastCheckOutDate: Date = undefined,
    isSignWaiverEnabled: boolean = false,
  ): Promise<object> {
    const codes = await this.getPropertyCodes(property.id);
    const context = {
      ownerName: `${user.firstName} ${user.lastName}`,
      propertyName: property.propertyName || 'N/A',
      propertyAddress: property.address || 'N/A',
      bookingId: booking.bookingId || 'N/A',
      lastCheckIn: lastCheckInDate
        ? format(lastCheckInDate, 'MM/dd/yyyy @ KK:mm aa')
        : 'N/A',
      lastCheckOut: lastCheckOutDate
        ? format(lastCheckOutDate, 'MM/dd/yyyy @ KK:mm aa')
        : 'N/A',
      checkIn: booking.checkinDate
        ? format(booking.checkinDate, 'MM/dd/yyyy @ KK:mm aa')
        : 'N/A',
      checkOut: booking.checkoutDate
        ? format(booking.checkoutDate, 'MM/dd/yyyy @ KK:mm aa')
        : 'N/A',
      adults: booking.noOfAdults || 0,
      children: booking.noOfChildren || 0,
      pets: booking.noOfPets || 0,
      notes: booking.notes || 'None',
      banner: imageUrl || 'default-banner-url.jpg',
      totalNights: booking.totalNights || 0,
      modify: `${authConstants.hostname}:${authConstants.port}/${authConstants.endpoints.booking}`,
      cancel: `${authConstants.hostname}:${authConstants.port}/${authConstants.endpoints.booking}`,
      link: `${authConstants.hostname}:${authConstants.port}/${authConstants.endpoints.booking}`,
      isSignWaiverEnabled,
      codes,
    };

    return context;
  }

  private async prepareEmailData(booking: Booking): Promise<
    | {
        owner: User;
        email: string;
        imageUrl: string;
        propertyName: Property;
      }
    | Error
  > {
    if (!booking || !booking.user || !booking.property) {
      return new Error('Invalid booking data');
    }

    const owner = await this.userRepository.findOne({
      where: { id: booking.user.id },
    });

    if (!owner) {
      return new Error(`Owner not found for user ID: ${booking.user.id}`);
    }

    const email = await this.getPrimaryEmail(booking);

    if (!email) {
      throw new Error(
        `Primary email not found for user ID: ${booking.user.id}`,
      );
    }

    const imageUrl: string = await this.getBannerImage(booking);

    const propertyName: Property = await this.bookingUtilService.getProperty(
      booking.property.id,
    );

    return {
      owner,
      email,
      imageUrl,
      propertyName,
    };
  }

  private async sendEmail(
    email: string,
    subject: string,
    template: string,
    context: object,
    actionType: string,
  ): Promise<void> {
    try {
      await this.mailService.sendMail(email, subject, template, context);
      this.logger.log(`Booking ${actionType} email has been sent to: ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send booking ${actionType} email: ${error.message}`,
      );
    }
  }

  private async getBookingListForReminder(
    reminderDays: number,
    isCheckOut: boolean,
  ): Promise<Booking[]> {
    const { startOfDay, endOfDay } = await this.getScheduledDate(reminderDays);

    if (isCheckOut) {
      const bookingsList: Booking[] = await this.bookingRepository.find({
        where: {
          checkoutDate: Between(startOfDay, endOfDay),
          isCancelled: Equal(false),
          isCompleted: Equal(false),
        },
        relations: {
          user: true,
          property: true,
        },
      });

      return bookingsList;
    }

    const bookingsList: Booking[] = await this.bookingRepository.find({
      where: {
        checkinDate: Between(startOfDay, endOfDay),
        isCancelled: Equal(false),
        isCompleted: Equal(false),
      },
      relations: {
        user: true,
        property: true,
      },
    });

    return bookingsList;
  }

  private async getReminderTemplate(
    reminderType: ReminderType,
  ): Promise<string> {
    return mailTemplates.reminder[reminderType];
  }

  private async getReminderSubject(
    reminderType: ReminderType,
  ): Promise<string> {
    return mailSubject.reminder[reminderType];
  }

  async sendBookingConfirmationEmail(booking: Booking): Promise<void | Error> {
    const data = await this.prepareEmailData(booking);
    if (data instanceof Error) return data;
    const { owner, email, imageUrl, propertyName } = data;
    const subject = mailSubject.booking.confirmation;
    const template = mailTemplates.booking.confirmation;
    const context = await this.createEmailContext(
      booking,
      propertyName,
      owner,
      imageUrl,
    );

    await this.sendEmail(email, subject, template, context, 'confirmation');
  }

  async sendBookingModificationEmail(
    booking: Booking,
    lastCheckInDate: Date,
    lastCheckOutDate: Date,
  ): Promise<void | Error> {
    if (!lastCheckInDate || !lastCheckOutDate) {
      return new Error('Invalid existing booking date');
    }

    const data = await this.prepareEmailData(booking);
    if (data instanceof Error) return data;
    const { owner, email, imageUrl, propertyName } = data;

    const subject = mailSubject.booking.modification;
    const template = mailTemplates.booking.modification;
    const context = await this.createEmailContext(
      booking,
      propertyName,
      owner,
      imageUrl,
      lastCheckInDate,
      lastCheckOutDate,
    );

    await this.sendEmail(email, subject, template, context, 'modification');
  }

  async sendBookingCancellationEmail(booking: Booking): Promise<void | Error> {
    const data = await this.prepareEmailData(booking);
    if (data instanceof Error) return data;
    const { owner, email, propertyName } = data;

    const subject = mailSubject.booking.cancellation;
    const template = mailTemplates.booking.cancellation;
    const context = await this.createEmailContext(booking, propertyName, owner);

    await this.sendEmail(email, subject, template, context, 'cancellation');
  }

  async sendReminderEmail(
    reminderDays: number,
    name: string,
    type: ReminderType,
    isCheckOut: boolean = false,
  ): Promise<void | Error> {
    const reminderBookingsList = await this.getBookingListForReminder(
      reminderDays,
      isCheckOut,
    );

    if (!reminderBookingsList || reminderBookingsList.length === 0) {
      this.logger.warn('Reminder Booking List was empty or not found!');
      return;
    }

    for (const booking of reminderBookingsList) {
      const data = await this.prepareEmailData(booking);
      if (data instanceof Error) return data;
      const { owner, email, imageUrl, propertyName } = data;

      let isSignWaiverEnabled: boolean = false;
      if (
        SignWaiverRequiredProperties.find(
          (property) => property === booking.property.propertyName,
        )
      ) {
        isSignWaiverEnabled = true;
      }

      const subject = await this.getReminderSubject(type);
      const template = await this.getReminderTemplate(type);
      const context = await this.createEmailContext(
        booking,
        propertyName,
        owner,
        imageUrl,
        undefined,
        undefined,
        isSignWaiverEnabled,
      );

      await this.sendEmail(email, subject, template, context, name);
    }

    return;
  }
}
