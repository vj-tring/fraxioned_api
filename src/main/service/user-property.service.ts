import { Injectable } from '@nestjs/common';
import { UserProperties } from 'entities/user-properties.entity';
import { LoggerService } from 'services/logger.service';
import { USER_PROPERTY_RESPONSES } from 'src/main/commons/constants/response-constants/user-property.constant';
import { CreateUserPropertyDTO } from '../dto/requests/user-property/create-user-property.dto';
import { UpdateUserPropertyDTO } from '../dto/requests/user-property/update-user-property.dto';
import { User } from 'src/main/entities/user.entity';
import { UserPropertyDto } from '../dto/requests/user-property/userProperty.dto';
import { UserPropertyRepository } from '../repository/user-property.repository';
import { PropertyRepository } from '../repository/property.repository';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserPropertyService {
  constructor(
    private readonly userPropertyRepository: UserPropertyRepository,
    private readonly userRepository: UserRepository,
    private readonly propertyRepository: PropertyRepository,
    private readonly logger: LoggerService,
  ) {}

  async createUserProperty(
    createUserPropertyDto: CreateUserPropertyDTO,
  ): Promise<object> {
    const user = await this.userRepository.findOne(
      createUserPropertyDto.user.id,
    );
    if (!user) {
      return USER_PROPERTY_RESPONSES.USER_NOT_FOUND(
        createUserPropertyDto.user.id,
      );
    }

    const createdBy = await this.userRepository.findOne(
      createUserPropertyDto.createdBy.id,
    );
    if (!createdBy) {
      return USER_PROPERTY_RESPONSES.USER_NOT_FOUND(
        createUserPropertyDto.createdBy.id,
      );
    }

    const userPropertyDetails: UserPropertyDto[] = [
      {
        propertyID: createUserPropertyDto.property.id,
        noOfShares: createUserPropertyDto.noOfShare,
        acquisitionDate: createUserPropertyDto.acquisitionDate,
      },
    ];

    const calculatedUserProperties = await this.calculateUserProperties(
      userPropertyDetails,
      user,
      createdBy,
      createdBy,
    );

    if (!Array.isArray(calculatedUserProperties)) {
      return calculatedUserProperties;
    }

    const savedUserProperties =
      await this.userPropertyRepository.saveUserProperties(
        calculatedUserProperties,
      );

    this.logger.log(`User properties created`);
    return USER_PROPERTY_RESPONSES.USER_PROPERTY_CREATED(savedUserProperties);
  }

  async getUserProperties(): Promise<object> {
    this.logger.log('Fetching all user properties');
    const userProperties =
      await this.userPropertyRepository.findAllUserProperties();
    if (userProperties.length === 0) {
      this.logger.warn('No user properties found');
      return USER_PROPERTY_RESPONSES.USER_PROPERTIES_NOT_FOUND();
    }
    return USER_PROPERTY_RESPONSES.USER_PROPERTIES_FETCHED(userProperties);
  }

  async getUserPropertyById(id: number): Promise<object> {
    this.logger.log(`Fetching user property with ID ${id}`);
    const userProperty =
      await this.userPropertyRepository.findUserPropertyById(id);
    if (!userProperty) {
      this.logger.warn(`User property with ID ${id} not found`);
      return USER_PROPERTY_RESPONSES.USER_PROPERTY_NOT_FOUND(id);
    }
    return USER_PROPERTY_RESPONSES.USER_PROPERTY_FETCHED(userProperty);
  }

  async updateUserProperty(
    updateUserPropertyDto: UpdateUserPropertyDTO,
  ): Promise<object> {
    const currentYear = new Date().getFullYear();

    const existingUserProperties =
      await this.userPropertyRepository.findUserPropertiesForUpdate(
        updateUserPropertyDto.user.id,
        updateUserPropertyDto.property.id,
        currentYear,
      );

    if (existingUserProperties.length === 0) {
      this.logger.warn(
        `No user properties found for the given criteria in current or future years`,
      );
      return USER_PROPERTY_RESPONSES.USER_PROPERTIES_NOT_FOUND();
    }

    const updatedBy = await this.userRepository.findOne(
      updateUserPropertyDto.updatedBy.id,
    );
    if (!updatedBy) {
      return USER_PROPERTY_RESPONSES.USER_NOT_FOUND(
        updateUserPropertyDto.updatedBy.id,
      );
    }

    const userPropertyDetails: UserPropertyDto[] = [
      {
        propertyID: updateUserPropertyDto.property.id,
        noOfShares:
          updateUserPropertyDto.noOfShare ??
          existingUserProperties[0].noOfShare,
        acquisitionDate:
          updateUserPropertyDto.acquisitionDate ??
          existingUserProperties[0].acquisitionDate,
      },
    ];

    const calculatedUserProperties = await this.calculateUserProperties(
      userPropertyDetails,
      existingUserProperties[0].user,
      existingUserProperties[0].createdBy,
      updatedBy,
    );

    if (!Array.isArray(calculatedUserProperties)) {
      this.logger.error(
        `Error calculating properties: ${JSON.stringify(calculatedUserProperties)}`,
      );
      return calculatedUserProperties;
    }

    try {
      const insertedProperties =
        await this.userPropertyRepository.updateUserProperties(
          existingUserProperties,
          calculatedUserProperties,
        );

      this.logger.log(
        `${insertedProperties.length} user properties updated for current and future years`,
      );
      return USER_PROPERTY_RESPONSES.USER_PROPERTIES_UPDATED(
        insertedProperties,
      );
    } catch (error) {
      this.logger.error(`Error updating user properties: ${error.message}`);
      return USER_PROPERTY_RESPONSES.USER_PROPERTIES_UPDATE_FAILED();
    }
  }

  async softDeleteUserProperty(
    userId: number,
    propertyId: number,
  ): Promise<object> {
    const userProperties =
      await this.userPropertyRepository.findUserPropertiesForDelete(
        userId,
        propertyId,
      );

    if (userProperties.length === 0) {
      this.logger.warn(
        `No user properties found for user ID ${userId} and property ID ${propertyId}`,
      );
      return USER_PROPERTY_RESPONSES.USER_PROPERTIES_NOT_FOUND();
    }

    const updatedUserProperties =
      await this.userPropertyRepository.removePropertyForUserByUserId(
        userProperties,
      );

    this.logger.log(
      `User properties for user ID ${userId} and property ID ${propertyId} updated to have null user`,
    );
    return USER_PROPERTY_RESPONSES.USER_PROPERTIES_UPDATED(
      updatedUserProperties,
    );
  }

  private async calculateUserProperties(
    userPropertyDetails: UserPropertyDto[],
    user: User,
    createdByUser: User,
    updatedByUser: User,
  ): Promise<UserProperties[] | object> {
    const currentYear = new Date().getFullYear();
    const userPropertyEntities: UserProperties[] = [];

    for (const propertyDetail of userPropertyDetails) {
      const propertyId = propertyDetail.propertyID;

      const userProperty =
        await this.propertyRepository.findProperty(propertyId);
      const userPropertyDetails =
        await this.propertyRepository.findPropertyDetails(propertyId);

      if (!userProperty || !userPropertyDetails) {
        this.logger.error(
          `Property or detail not found with ID: ${propertyId}`,
        );
        return !userProperty
          ? USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(propertyId)
          : USER_PROPERTY_RESPONSES.PROPERTY_DETAIL_NOT_FOUND(propertyId);
      }

      if (propertyDetail.noOfShares > userProperty.propertyRemainingShare) {
        this.logger.error(
          `Not enough remaining shares for property ID: ${propertyId}`,
        );
        return USER_PROPERTY_RESPONSES.INSUFFICIENT_SHARES(
          propertyId,
          userProperty.propertyRemainingShare,
        );
      }

      userProperty.propertyRemainingShare -= propertyDetail.noOfShares;
      await this.propertyRepository.saveProperty(userProperty);

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

      const maximumStayLength = Math.min(
        14 + (propertyDetail.noOfShares - 1) * 7,
        28,
      );

      for (let yearOffset = 0; yearOffset <= 3; yearOffset++) {
        const year = currentYear + yearOffset;
        const isCurrentYear = year === currentYear;

        const peakSeasonEndDate = new Date(
          userPropertyDetails.peakSeasonEndDate,
        );
        const acquisitionDate = new Date(propertyDetail.acquisitionDate);
        const isAfterPeakSeasonEndDate = acquisitionDate > peakSeasonEndDate;

        userPropertyEntities.push(
          this.userPropertyRepository.create({
            property: userProperty,
            noOfShare: propertyDetail.noOfShares,
            acquisitionDate: acquisitionDate,
            user,
            year,
            createdBy: createdByUser,
            updatedBy: updatedByUser,
            peakAllottedNights: isCurrentYear
              ? isAfterPeakSeasonEndDate
                ? 0
                : ratedPeakAllottedNights
              : peakAllottedNights,
            peakRemainingNights: isCurrentYear
              ? isAfterPeakSeasonEndDate
                ? 0
                : ratedPeakAllottedNights
              : peakAllottedNights,
            peakAllottedHolidayNights: isCurrentYear
              ? isAfterPeakSeasonEndDate
                ? 0
                : peakAllottedHolidayNights
              : peakAllottedHolidayNights,
            peakRemainingHolidayNights: isCurrentYear
              ? isAfterPeakSeasonEndDate
                ? 0
                : peakAllottedHolidayNights
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
          } as UserProperties),
        );
      }
    }

    return userPropertyEntities;
  }

  private calculateAllottedNights(
    noOfShares: number,
    baseAllottedNights: number,
  ): number {
    return noOfShares * baseAllottedNights;
  }

  private rateNights(allottedNights: number, acquisitionDate: Date): number {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const endOfYear = new Date(currentYear, 11, 30);

    const isLeapYear = (year: number): boolean => {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };

    const daysInYear = isLeapYear(currentYear) ? 366 : 365;
    const adjustedDaysInYear = daysInYear - 1;

    const isAcquisitionInCurrentYear =
      acquisitionDate.getFullYear() === currentYear &&
      acquisitionDate <= endOfYear;

    let daysRemaining: number;
    if (isAcquisitionInCurrentYear) {
      daysRemaining =
        Math.ceil(
          (endOfYear.getTime() - acquisitionDate.getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1;
    } else {
      daysRemaining = adjustedDaysInYear;
    }

    return Math.floor((daysRemaining / adjustedDaysInYear) * allottedNights);
  }
}
