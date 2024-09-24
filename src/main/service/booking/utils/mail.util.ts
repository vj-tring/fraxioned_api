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

@Injectable()
export class BookingMailService {
  constructor(
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

      const contacts = await this.userContactDetailsRepository.find({
        where: { user: { id: booking.user.id } },
        select: ['primaryEmail'],
      });

      if (!contacts || contacts.length === 0) {
        return new Error(
          `Contact details not found for user ID: ${booking.user.id}`,
        );
      }

      const banner = await this.spaceTypesRepository.findOne({
        where: { name: 'Banner', space: { id: 1 } },
      });

      if (!banner) {
        this.logger.warn('Banner space type not found');
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
      }

      const { primaryEmail: email } = contacts[0];
      if (!email) {
        throw new Error(
          `Primary email not found for user ID: ${booking.user.id}`,
        );
      }

      const propertyName = await this.bookingUtilService.getProperty(
        booking.property.id,
      );

      const subject = mailSubject.booking.confirmation;
      const template = mailTemplates.booking.confirmation;
      const context = {
        ownerName: `${owner.firstName} ${owner.lastName}`,
        propertyName: propertyName.propertyName || 'N/A',
        bookingId: booking.bookingId || 'N/A',
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

      await this.mailService.sendMail(email, subject, template, context);
      this.logger.log(`Booking confirmation email has been sent to: ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation email: ${error.message}`,
      );
    }
  }
}
