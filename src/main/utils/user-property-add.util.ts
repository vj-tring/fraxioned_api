import { Repository } from 'typeorm';
import { User } from 'src/main/entities/user.entity';
import { Property } from 'src/main/entities/property.entity';
import { PropertyDetails } from 'src/main/entities/property-details.entity';
import { UserProperties } from 'src/main/entities/user-properties.entity';
import { LoggerService } from 'src/main/service/logger.service';
import { USER_PROPERTY_RESPONSES } from 'src/main/commons/constants/response-constants/user-property.constant';
import { UserPropertyDto } from '../dto/requests/user-property/userProperty.dto';

export async function calculateUserProperties(
  userPropertyDetails: UserPropertyDto[],
  user: User,
  createdByUser: User,
  updatedByUser: User,
  propertyRepository: Repository<Property>,
  propertyDetailsRepository: Repository<PropertyDetails>,
  userPropertyRepository: Repository<UserProperties>,
  logger: LoggerService,
): Promise<UserProperties[] | object> {
  const currentYear = new Date().getFullYear();
  const userPropertyEntities: UserProperties[] = [];

  for (const propertyDetail of userPropertyDetails) {
    const propertyId = propertyDetail.propertyID;
    const userProperty = await propertyRepository.findOne({
      where: { id: propertyId },
    });
    const userPropertyDetails = await propertyDetailsRepository.findOne({
      where: { id: propertyId },
    });

    if (!userProperty) {
      logger.error(`Property not found with ID: ${propertyId}`);
      return USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(propertyId);
    }

    if (!userPropertyDetails) {
      this.logger.error(`Property detail not found with ID: ${propertyId}`);
      return USER_PROPERTY_RESPONSES.PROPERTY_DETAIL_NOT_FOUND(propertyId);
    }

    if (propertyDetail.noOfShares > userProperty.propertyRemainingShare) {
      logger.error(
        `Not enough remaining shares for property ID: ${propertyId}`,
      );
      return USER_PROPERTY_RESPONSES.INSUFFICIENT_SHARES(
        propertyId,
        userProperty.propertyRemainingShare,
      );
    }

    userProperty.propertyRemainingShare -= propertyDetail.noOfShares;
    await propertyRepository.save(userProperty);

    const peakAllottedNights = calculateAllottedNights(
      propertyDetail.noOfShares,
      userPropertyDetails.peakSeasonAllottedNights,
    );
    const offAllottedNights = calculateAllottedNights(
      propertyDetail.noOfShares,
      userPropertyDetails.offSeasonAllottedNights,
    );
    const peakAllottedHolidayNights = calculateAllottedNights(
      propertyDetail.noOfShares,
      userPropertyDetails.peakSeasonAllottedHolidayNights,
    );
    const offAllottedHolidayNights = calculateAllottedNights(
      propertyDetail.noOfShares,
      userPropertyDetails.offSeasonAllottedHolidayNights,
    );

    const ratedPeakAllottedNights = rateNights(
      peakAllottedNights,
      new Date(propertyDetail.acquisitionDate),
    );
    const ratedOffAllottedNights = rateNights(
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

      const peakSeasonEndDate = new Date(userPropertyDetails.peakSeasonEndDate);
      const acquisitionDate = new Date(propertyDetail.acquisitionDate);
      const isAfterPeakSeasonEndDate = acquisitionDate > peakSeasonEndDate;

      userPropertyEntities.push(
        userPropertyRepository.create({
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

function calculateAllottedNights(
  noOfShares: number,
  baseAllottedNights: number,
): number {
  return noOfShares * baseAllottedNights;
}

function rateNights(allottedNights: number, acquisitionDate: Date): number {
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
