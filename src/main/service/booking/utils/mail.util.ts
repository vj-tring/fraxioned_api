import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { LoggerService } from 'services/logger.service';
import {
  mailSubject,
  mailTemplates,
} from 'src/main/commons/constants/email/mail.constants';
import { MailService } from 'src/main/email/mail.service';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { User } from 'src/main/entities/user.entity';
import { format } from 'date-fns';
import { SpaceTypes } from 'src/main/entities/space-types.entity';
import { PropertyImages } from 'src/main/entities/property_images.entity';
import { authConstants } from 'src/main/commons/constants/authentication/authentication.constants';
import { BookingUtilService } from './booking.service.util';
import { Property } from 'src/main/entities/property.entity';

@Injectable()
export class BookingMailService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(UserContactDetails)
    private readonly userContactDetailsRepository: Repository<UserContactDetails>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SpaceTypes)
    private readonly spaceTypesRepository: Repository<SpaceTypes>,
    @InjectRepository(PropertyImages)
    private readonly propertyImagesRepository: Repository<PropertyImages>,
    private readonly logger: LoggerService,
    private readonly mailService: MailService,
    private readonly bookingUtilService: BookingUtilService,
  ) {}

  async getBannerImage(booking: Booking): Promise<string> {
    const banner = await this.spaceTypesRepository.findOne({
      where: { name: 'Banner', space: { id: 1 } },
    });

    if (!banner) {
      this.logger.warn('Banner space type not found');
      return;
    }

    let imageUrl = '';
    if (banner) {
      const image = await this.propertyImagesRepository.findOne({
        where: {
          spaceType: { id: banner.id },
          property: { id: booking.property.id },
        },
      });

      if (image) {
        imageUrl = image.imageUrl;
        this.logger.log(`Banner Image URL: ${imageUrl}`);
      } else {
        this.logger.warn(
          `No banner image found for property ID: ${booking.property.id}`,
        );
      }

      return imageUrl;
    }
  }

  async getPrimaryEmail(booking: Booking): Promise<string> {
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

  async createEmailContext(
    booking: Booking,
    property: Property,
    user: User,
    imageUrl: string = '',
    lastCheckInDate: Date = undefined,
    lastCheckOutDate: Date = undefined,
  ): Promise<object> {
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
    };

    return context;
  }

  async sendBookingConfirmationEmail(booking: Booking): Promise<void | Error> {
    try {
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

      const imageUrl = await this.getBannerImage(booking);

      const propertyName = await this.bookingUtilService.getProperty(
        booking.property.id,
      );

      const subject = mailSubject.booking.confirmation;
      const template = mailTemplates.booking.confirmation;
      const context = await this.createEmailContext(
        booking,
        propertyName,
        owner,
        imageUrl,
      );

      await this.mailService.sendMail(email, subject, template, context);
      this.logger.log(`Booking confirmation email has been sent to: ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation email: ${error.message}`,
      );
    }
  }

  async sendBookingModificationEmail(
    booking: Booking,
    lastCheckInDate: Date,
    lastCheckOutDate: Date,
  ): Promise<void | Error> {
    try {
      if (!booking || !booking.user || !booking.property) {
        return new Error('Invalid booking data');
      }

      if (!lastCheckInDate || !lastCheckOutDate) {
        return new Error('Invalid existing booking date');
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

      const imageUrl = await this.getBannerImage(booking);

      const propertyName = await this.bookingUtilService.getProperty(
        booking.property.id,
      );

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

      await this.mailService.sendMail(email, subject, template, context);
      this.logger.log(
        `Booking update confirmation email has been sent to: ${email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send booking update confirmation email: ${error.message}`,
      );
    }
  }

  async sendBookingCancellationEmail(booking: Booking): Promise<void | Error> {
    try {
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

      const propertyName = await this.bookingUtilService.getProperty(
        booking.property.id,
      );

      const subject = mailSubject.booking.cancellation;
      const template = mailTemplates.booking.cancellation;
      const context = await this.createEmailContext(
        booking,
        propertyName,
        owner,
      );

      await this.mailService.sendMail(email, subject, template, context);
      this.logger.log(`Booking cancellation email has been sent to: ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send booking cancellation email: ${error.message}`,
      );
    }
  }
}
