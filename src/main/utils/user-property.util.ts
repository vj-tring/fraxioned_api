import { User } from 'src/main/entities/user.entity';
import { UserProperties } from 'src/main/entities/user-properties.entity';
import { LoggerService } from 'src/main/service/logger.service';
import { USER_PROPERTY_RESPONSES } from 'src/main/commons/constants/response-constants/user-property.constant';
import { UserPropertyDto } from '../dto/requests/user-property/userProperty.dto';
import { PropertyRepository } from '../repository/property.repository';
import { UserPropertyRepository } from '../repository/user-property.repository';
import { PropertyDetailsRepository } from '../repository/property-details.repository';

export async function updateAvailableNightsForUserByProperty(
  userPropertyDetails: UserPropertyDto[],
  user: User,
  propertyRepository: PropertyRepository,
  propertyDetailsRepository: PropertyDetailsRepository,
  userPropertyRepository: UserPropertyRepository,
  logger: LoggerService,
  existingUserProperties?: UserProperties[],
  createdByUser?: User,
  updatedByUser?: User,
): Promise<UserProperties[] | object> {
  const currentYear = new Date().getFullYear();
  const userPropertyEntities: UserProperties[] = [];

  for (const propertyDetail of userPropertyDetails) {
    const propertyId = propertyDetail.propertyID;

    const userProperty = await propertyRepository.findProperty(propertyId);
    const userPropertyDetails =
      await propertyDetailsRepository.findOne(propertyId);

    if (!userProperty || !userPropertyDetails) {
      logger.error(`Property or detail not found with ID: ${propertyId}`);
      return !userProperty
        ? USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(propertyId)
        : USER_PROPERTY_RESPONSES.PROPERTY_DETAIL_NOT_FOUND(propertyId);
    }

    let shareDifference = 0;
    if (existingUserProperties && existingUserProperties.length > 0) {
      const oldShares = existingUserProperties[0].noOfShare;
      const newShares = propertyDetail.noOfShares;
      shareDifference = newShares - oldShares;

      if (shareDifference !== 0) {
        if (
          shareDifference > 0 &&
          shareDifference > userProperty.propertyRemainingShare
        ) {
          logger.error(
            `Not enough remaining shares for property ID: ${propertyId}. Need ${shareDifference} more shares but only ${userProperty.propertyRemainingShare} available.`,
          );
          return USER_PROPERTY_RESPONSES.INSUFFICIENT_SHARES(
            propertyId,
            userProperty.propertyRemainingShare,
          );
        }

        userProperty.propertyRemainingShare -= shareDifference;
        await propertyRepository.saveProperty(userProperty);
      }
    } else {
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
      await propertyRepository.saveProperty(userProperty);
    }

    const acquisitionDate = new Date(propertyDetail.acquisitionDate);
    const isAcquisitionInCurrentYear =
      acquisitionDate.getFullYear() === currentYear;

    const peakAllottedNights = calculateAllottedNightsForUser(
      propertyDetail.noOfShares,
      userPropertyDetails.peakSeasonAllottedNights,
    );
    const offAllottedNights = calculateAllottedNightsForUser(
      propertyDetail.noOfShares,
      userPropertyDetails.offSeasonAllottedNights,
    );
    const peakAllottedHolidayNights = calculateAllottedNightsForUser(
      propertyDetail.noOfShares,
      userPropertyDetails.peakSeasonAllottedHolidayNights,
    );
    const offAllottedHolidayNights = calculateAllottedNightsForUser(
      propertyDetail.noOfShares,
      userPropertyDetails.offSeasonAllottedHolidayNights,
    );

    const ratedPeakAllottedNights =
      isAcquisitionInCurrentYear && shareDifference > 0
        ? calculateAllottedNightsForUser(
            shareDifference,
            userPropertyDetails.peakSeasonAllottedNights,
          )
        : rateNights(peakAllottedNights, acquisitionDate);

    const ratedOffAllottedNights =
      isAcquisitionInCurrentYear && shareDifference > 0
        ? calculateAllottedNightsForUser(
            shareDifference,
            userPropertyDetails.offSeasonAllottedNights,
          )
        : rateNights(offAllottedNights, acquisitionDate);

    const ratedPeakHolidayNights =
      isAcquisitionInCurrentYear && shareDifference > 0
        ? calculateAllottedNightsForUser(
            shareDifference,
            userPropertyDetails.peakSeasonAllottedHolidayNights,
          )
        : rateNights(peakAllottedHolidayNights, acquisitionDate);

    const ratedOffHolidayNights =
      isAcquisitionInCurrentYear && shareDifference > 0
        ? calculateAllottedNightsForUser(
            shareDifference,
            userPropertyDetails.offSeasonAllottedHolidayNights,
          )
        : rateNights(offAllottedHolidayNights, acquisitionDate);

    const maximumStayLength = Math.min(
      14 + (propertyDetail.noOfShares - 1) * 7,
      28,
    );

    for (let yearOffset = 0; yearOffset <= 3; yearOffset++) {
      const year = currentYear + yearOffset;
      const isCurrentYear = year === currentYear;

      const peakSeasonEndDate = new Date(userPropertyDetails.peakSeasonEndDate);
      const isAfterPeakSeasonEndDate = acquisitionDate > peakSeasonEndDate;

      let currentYearPeakNights = peakAllottedNights;
      let currentYearOffNights = offAllottedNights;
      let currentYearPeakHolidayNights = peakAllottedHolidayNights;
      let currentYearOffHolidayNights = offAllottedHolidayNights;

      if (
        isCurrentYear &&
        existingUserProperties &&
        existingUserProperties.length > 0
      ) {
        const existingProperty = existingUserProperties.find(
          (p) => p.year === currentYear,
        );
        if (existingProperty) {
          currentYearPeakNights = isAfterPeakSeasonEndDate
            ? existingProperty.peakRemainingNights
            : existingProperty.peakRemainingNights + ratedPeakAllottedNights;
          currentYearOffNights =
            existingProperty.offRemainingNights + ratedOffAllottedNights;
          currentYearPeakHolidayNights = isAfterPeakSeasonEndDate
            ? existingProperty.peakRemainingHolidayNights
            : existingProperty.peakRemainingHolidayNights +
              ratedPeakHolidayNights;
          currentYearOffHolidayNights =
            existingProperty.offRemainingHolidayNights + ratedOffHolidayNights;
        }
      } else if (isCurrentYear) {
        currentYearPeakNights = isAfterPeakSeasonEndDate
          ? 0
          : ratedPeakAllottedNights;
        currentYearOffNights = ratedOffAllottedNights;
        currentYearPeakHolidayNights = isAfterPeakSeasonEndDate
          ? 0
          : ratedPeakHolidayNights;
        currentYearOffHolidayNights = ratedOffHolidayNights;
      }

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
            ? currentYearPeakNights
            : peakAllottedNights,
          peakRemainingNights: isCurrentYear
            ? currentYearPeakNights
            : peakAllottedNights,
          peakAllottedHolidayNights: isCurrentYear
            ? currentYearPeakHolidayNights
            : peakAllottedHolidayNights,
          peakRemainingHolidayNights: isCurrentYear
            ? currentYearPeakHolidayNights
            : peakAllottedHolidayNights,
          offAllottedNights: isCurrentYear
            ? currentYearOffNights
            : offAllottedNights,
          offRemainingNights: isCurrentYear
            ? currentYearOffNights
            : offAllottedNights,
          offAllottedHolidayNights: isCurrentYear
            ? currentYearOffHolidayNights
            : offAllottedHolidayNights,
          offRemainingHolidayNights: isCurrentYear
            ? currentYearOffHolidayNights
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

export async function calculateAvailableNightsForUserByProperty(
  userPropertyDetails: UserPropertyDto[],
  user: User,
  propertyRepository: PropertyRepository,
  propertyDetailsRepository: PropertyDetailsRepository,
  userPropertyRepository: UserPropertyRepository,
  logger: LoggerService,
  existingUserProperties?: UserProperties[],
  createdByUser?: User,
  updatedByUser?: User,
): Promise<UserProperties[] | object> {
  const currentYear = new Date().getFullYear();
  const userPropertyEntities: UserProperties[] = [];

  for (const propertyDetail of userPropertyDetails) {
    const propertyId = propertyDetail.propertyID;

    const userProperty = await propertyRepository.findProperty(propertyId);
    const userPropertyDetails =
      await propertyDetailsRepository.findOne(propertyId);

    if (!userProperty || !userPropertyDetails) {
      logger.error(`Property or detail not found with ID: ${propertyId}`);
      return !userProperty
        ? USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(propertyId)
        : USER_PROPERTY_RESPONSES.PROPERTY_DETAIL_NOT_FOUND(propertyId);
    }

    if (existingUserProperties && existingUserProperties.length > 0) {
      const oldShares = existingUserProperties[0].noOfShare;
      const newShares = propertyDetail.noOfShares;
      const shareDifference = newShares - oldShares;

      if (shareDifference !== 0) {
        if (
          shareDifference > 0 &&
          shareDifference > userProperty.propertyRemainingShare
        ) {
          logger.error(
            `Not enough remaining shares for property ID: ${propertyId}. Need ${shareDifference} more shares but only ${userProperty.propertyRemainingShare} available.`,
          );
          return USER_PROPERTY_RESPONSES.INSUFFICIENT_SHARES(
            propertyId,
            userProperty.propertyRemainingShare,
          );
        }

        userProperty.propertyRemainingShare -= shareDifference;
        await propertyRepository.saveProperty(userProperty);
      }
    } else {
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
      await propertyRepository.saveProperty(userProperty);
    }

    const peakAllottedNights = calculateAllottedNightsForUser(
      propertyDetail.noOfShares,
      userPropertyDetails.peakSeasonAllottedNights,
    );
    const offAllottedNights = calculateAllottedNightsForUser(
      propertyDetail.noOfShares,
      userPropertyDetails.offSeasonAllottedNights,
    );
    const peakAllottedHolidayNights = calculateAllottedNightsForUser(
      propertyDetail.noOfShares,
      userPropertyDetails.peakSeasonAllottedHolidayNights,
    );
    const offAllottedHolidayNights = calculateAllottedNightsForUser(
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

function calculateAllottedNightsForUser(
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
