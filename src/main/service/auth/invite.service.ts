import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InviteUserDto } from 'src/main/dto/requests/auth/inviteUser.dto';
import { User } from 'src/main/entities/user.entity';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { UserProperties } from 'src/main/entities/user-properties.entity';
import { Role } from 'src/main/entities/role.entity';
import { Property } from 'src/main/entities/property.entity';
import { PropertyDetails } from 'src/main/entities/property-details.entity';
import { LoggerService } from 'src/main/service/logger.service';
import { authConstants } from 'src/main/commons/constants/authentication/authentication.constants';
import {
  mailSubject,
  mailTemplates,
} from 'src/main/commons/constants/email/mail.constants';
import { INVITE_USER_RESPONSES } from 'src/main/commons/constants/response-constants/auth.constant';
import { ROLE_RESPONSES } from 'src/main/commons/constants/response-constants/role.constant';
import { USER_PROPERTY_RESPONSES } from 'src/main/commons/constants/response-constants/user-property.constant';
import { USER_RESPONSES } from 'src/main/commons/constants/response-constants/user.constant';
import { MailService } from 'src/main/email/mail.service';

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserContactDetails)
    private readonly userContactRepository: Repository<UserContactDetails>,
    @InjectRepository(UserProperties)
    private readonly userPropertyRepository: Repository<UserProperties>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyDetails)
    private readonly propertyDetailsRepository: Repository<PropertyDetails>,
    private readonly mailService: MailService,
    private readonly logger: LoggerService,
  ) {}

  async inviteUser(inviteUserDto: InviteUserDto): Promise<object> {
    try {
      const {
        email,
        firstName,
        lastName,
        addressLine1,
        addressLine2,
        state,
        country,
        city,
        zipcode,
        phoneNumber,
        roleId,
        createdBy,
        updatedBy,
        userPropertyDetails,
      } = inviteUserDto;

      this.logger.log(`Inviting user with email: ${email}`);

      const existingUserEmail = await this.userContactRepository.findOne({
        where: { contactValue: email, contactType: 'email' },
      });
      if (existingUserEmail) {
        this.logger.error(`Email already exists: ${email}`);
        return INVITE_USER_RESPONSES.EMAIL_EXISTS;
      }

      // Validate createdBy user
      const createdByUser = await this.userRepository.findOne({
        where: { id: createdBy },
      });
      if (!createdByUser) {
        this.logger.error(`CreatedBy user not found with ID: ${createdBy}`);
        return USER_RESPONSES.USER_NOT_FOUND(createdBy);
      }

      // Validate updatedBy user
      const updatedByUser = await this.userRepository.findOne({
        where: { id: updatedBy },
      });
      if (!updatedByUser) {
        this.logger.error(`UpdatedBy user not found with ID: ${updatedBy}`);
        return USER_RESPONSES.USER_NOT_FOUND(updatedBy);
      }

      // Validate role
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        this.logger.error(`Role not found with ID: ${roleId}`);
        return ROLE_RESPONSES.ROLE_NOT_FOUND(roleId);
      }

      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const user = this.userRepository.create({
        firstName,
        lastName,
        addressLine1,
        addressLine2,
        state,
        country,
        city,
        zipcode,
        password: hashedPassword,
        isActive: true,
        createdBy: createdByUser.id,
        updatedBy: updatedByUser.id,
        role: role,
      });
      await this.userRepository.save(user);

      const userContacts = [
        {
          user,
          contactType: 'email',
          contactValue: email,
          createdBy: createdByUser,
          updatedBy: updatedByUser,
        },
        {
          user,
          contactType: 'phone',
          contactValue: phoneNumber,
          createdBy: createdByUser,
          updatedBy: updatedByUser,
        },
      ];

      for (const contact of userContacts) {
        const userContact = this.userContactRepository.create(contact);
        await this.userContactRepository.save(userContact);
      }

      const currentYear = new Date().getFullYear();
      const userPropertyEntities = [];

      for (const propertyDetail of userPropertyDetails) {
        // Validate property
        const propertyId = propertyDetail.propertyID;
        const userProperty = await this.propertyRepository.findOne({
          where: { id: propertyId },
        });
        const userPropertyDetails =
          await this.propertyDetailsRepository.findOne({
            where: { id: propertyId },
          });
        if (!userProperty) {
          this.logger.error(`Property not found with ID: ${propertyId}`);
          return USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(propertyId);
        }

        // Calculate prorated nights
        const peakAllottedNights = this.calculateAllottedNights(
          propertyDetail.noOfShares,
          userPropertyDetails.peakSeasonAllottedNights,
        );
        const offAllottedNights = this.calculateAllottedNights(
          propertyDetail.noOfShares,
          userPropertyDetails.offSeasonAllottedNights,
        );
        const peakAllottedHolidayNights = this.calculateAllottedNights(
          propertyDetail.noOfShares,
          userPropertyDetails.peakSeasonAllottedHolidayNights,
        );
        const offAllottedHolidayNights = this.calculateAllottedNights(
          propertyDetail.noOfShares,
          userPropertyDetails.offSeasonAllottedHolidayNights,
        );

        const ratedPeakAllottedNights = this.rateNights(
          peakAllottedNights,
          new Date(propertyDetail.acquisitionDate),
        );
        const ratedOffAllottedNights = this.rateNights(
          offAllottedNights,
          new Date(propertyDetail.acquisitionDate),
        );

        // Calculate maximum stay length
        const maximumStayLength = Math.min(
          14 + (propertyDetail.noOfShares - 1) * 7,
          28,
        );

        for (let yearOffset = 0; yearOffset <= 2; yearOffset++) {
          const year = currentYear + yearOffset;
          const isCurrentYear = year === currentYear;
          userPropertyEntities.push(
            this.userPropertyRepository.create({
              property: userProperty,
              noOfShare: propertyDetail.noOfShares,
              acquisitionDate: new Date(propertyDetail.acquisitionDate),
              user,
              year,
              createdBy: createdByUser,
              updatedBy: updatedByUser,
              peakAllottedNights: isCurrentYear
                ? ratedPeakAllottedNights
                : peakAllottedNights,
              peakRemainingNights: isCurrentYear
                ? ratedPeakAllottedNights
                : peakAllottedNights,
              peakAllottedHolidayNights: isCurrentYear
                ? peakAllottedHolidayNights
                : peakAllottedHolidayNights,
              peakRemainingHolidayNights: isCurrentYear
                ? peakAllottedHolidayNights
                : peakAllottedHolidayNights,
              offAllottedNights: isCurrentYear
                ? ratedOffAllottedNights
                : offAllottedNights,
              offRemainingNights: isCurrentYear
                ? ratedOffAllottedNights
                : offAllottedNights,
              offAllottedHolidayNights: isCurrentYear
                ? offAllottedHolidayNights
                : offAllottedHolidayNights,
              offRemainingHolidayNights: isCurrentYear
                ? offAllottedHolidayNights
                : offAllottedHolidayNights,
              lastMinuteAllottedNights: 8 * propertyDetail.noOfShares,
              lastMinuteRemainingNights: 8 * propertyDetail.noOfShares,
              maximumStayLength: maximumStayLength,
            } as unknown as UserProperties),
          );
        }
      }

      for (const userPropertyEntity of userPropertyEntities) {
        await this.userPropertyRepository.save(userPropertyEntity);
      }

      const loginLink = `${authConstants.hostname}:${authConstants.port}/${authConstants.endpoints.login}`;
      const subject = mailSubject.auth.registration;
      const template = mailTemplates.auth.registration;
      const context = {
        name: firstName,
        username: email,
        password: tempPassword,
        link: loginLink,
      };

      await this.mailService.sendMail(email, subject, template, context);

      this.logger.log(`Invite sent successfully to ${email}`);
      return INVITE_USER_RESPONSES.INVITE_SUCCESS;
    } catch (error) {
      this.logger.error(`Failed to invite user: ${error.message}`);
      throw error;
    }
  }
  private rateNights(allottedNights: number, acquisitionDate: Date): number {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const endOfYear = new Date(currentYear, 11, 30);

    // Check if the current year is a leap year
    const isLeapYear = (year: number): boolean => {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };

    const daysInYear = isLeapYear(currentYear) ? 366 : 365;

    // Adjust the days in the year to account for the calendar year ending on December 30
    const adjustedDaysInYear = daysInYear - 1;

    // Check if acquisition date is within the current calendar year
    const isAcquisitionInCurrentYear =
      acquisitionDate.getFullYear() === currentYear &&
      acquisitionDate <= endOfYear;

    let daysRemaining: number;
    if (isAcquisitionInCurrentYear) {
      // Calculate the difference in days, including the acquisition date
      daysRemaining =
        Math.ceil(
          (endOfYear.getTime() - acquisitionDate.getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1;
    } else {
      // Calculate the total days in the current calendar year
      daysRemaining = adjustedDaysInYear;
    }

    return Math.floor((daysRemaining / adjustedDaysInYear) * allottedNights);
  }

  private calculateAllottedNights(
    noOfShares: number,
    baseAllottedNights: number,
  ): number {
    return noOfShares * baseAllottedNights;
  }
}