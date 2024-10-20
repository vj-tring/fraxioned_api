import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProperties } from 'entities/user-properties.entity';
import { LoggerService } from 'services/logger.service';
import { USER_PROPERTY_RESPONSES } from 'src/main/commons/constants/response-constants/user-property.constant';
import { CreateUserPropertyDTO } from '../dto/requests/user-property/create-user-property.dto';
import { UpdateUserPropertyDTO } from '../dto/requests/user-property/update-user-property.dto';
import { User } from 'src/main/entities/user.entity';
import { Property } from 'src/main/entities/property.entity';
import { PropertyDetails } from 'src/main/entities/property-details.entity';
import { UserPropertyDto } from '../dto/requests/user-property/userProperty.dto';

@Injectable()
export class UserPropertyService {
  constructor(
    @InjectRepository(UserProperties)
    private readonly userPropertyRepository: Repository<UserProperties>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyDetails)
    private readonly propertyDetailsRepository: Repository<PropertyDetails>,
    private readonly logger: LoggerService,
  ) {}

  async createUserProperty(
    createUserPropertyDto: CreateUserPropertyDTO,
  ): Promise<object> {
    const user = await this.userRepository.findOne({
      where: { id: createUserPropertyDto.user.id },
    });
    if (!user) {
      return USER_PROPERTY_RESPONSES.USER_NOT_FOUND(
        createUserPropertyDto.user.id,
      );
    }

    const createdBy = await this.userRepository.findOne({
      where: { id: createUserPropertyDto.createdBy.id },
    });
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

    const savedUserProperties: UserProperties[] = [];
    for (const userProperty of calculatedUserProperties) {
      const savedUserProperty =
        await this.userPropertyRepository.save(userProperty);
      savedUserProperties.push(savedUserProperty);
    }

    this.logger.log(`User properties created`);
    return USER_PROPERTY_RESPONSES.USER_PROPERTY_CREATED(savedUserProperties);
  }
  async getUserProperties(): Promise<object> {
    this.logger.log('Fetching all user properties');
    const userProperties = await this.userPropertyRepository.find({
      relations: ['user', 'property', 'createdBy', 'updatedBy'],
      select: {
        user: { id: true },
        property: { id: true },
        createdBy: { id: true },
        updatedBy: { id: true },
      },
    });
    if (userProperties.length === 0) {
      this.logger.warn('No user properties found');
      return USER_PROPERTY_RESPONSES.USER_PROPERTIES_NOT_FOUND();
    }
    return USER_PROPERTY_RESPONSES.USER_PROPERTIES_FETCHED(userProperties);
  }

  async getUserPropertyById(id: number): Promise<object> {
    this.logger.log(`Fetching user property with ID ${id}`);
    const userProperty = await this.userPropertyRepository.findOne({
      relations: ['user', 'property', 'createdBy', 'updatedBy'],
      select: {
        user: { id: true },
        property: { id: true },
        createdBy: { id: true },
        updatedBy: { id: true },
      },
      where: { id },
    });
    if (!userProperty) {
      this.logger.warn(`User property with ID ${id} not found`);
      return USER_PROPERTY_RESPONSES.USER_PROPERTY_NOT_FOUND(id);
    }
    return USER_PROPERTY_RESPONSES.USER_PROPERTY_FETCHED(userProperty);
  }

  async updateUserProperty(
    updateUserPropertyDto: UpdateUserPropertyDTO,
  ): Promise<object> {
    const existingUserProperties = await this.userPropertyRepository.find({
      where: {
        user: { id: updateUserPropertyDto.user.id },
        property: { id: updateUserPropertyDto.property.id },
      },
      relations: ['user', 'property', 'createdBy'],
    });

    if (existingUserProperties.length === 0) {
      this.logger.warn(`No user properties found for the given criteria`);
      return USER_PROPERTY_RESPONSES.USER_PROPERTIES_NOT_FOUND();
    }

    const updatedBy = await this.userRepository.findOne({
      where: { id: updateUserPropertyDto.updatedBy.id },
    });

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

    const queryRunner =
      this.userPropertyRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.remove(existingUserProperties);

      const insertedProperties = await queryRunner.manager.save(
        UserProperties,
        calculatedUserProperties,
      );

      await queryRunner.commitTransaction();

      this.logger.log(`${insertedProperties.length} user properties updated`);
      return USER_PROPERTY_RESPONSES.USER_PROPERTIES_UPDATED(
        insertedProperties,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error updating user properties: ${error.message}`);
      return USER_PROPERTY_RESPONSES.USER_PROPERTIES_UPDATE_FAILED();
    } finally {
      await queryRunner.release();
    }
  }

  async deleteUserProperty(
    userId: number,
    propertyId: number,
  ): Promise<object> {
    const userProperties = await this.userPropertyRepository.find({
      where: {
        user: { id: userId },
        property: { id: propertyId },
      },
      relations: ['user', 'property'],
    });

    if (userProperties.length === 0) {
      this.logger.warn(
        `No user properties found for user ID ${userId} and property ID ${propertyId}`,
      );
      return USER_PROPERTY_RESPONSES.USER_PROPERTIES_NOT_FOUND();
    }

    for (const userProperty of userProperties) {
      userProperty.user = null;
      await this.userPropertyRepository.save(userProperty);
    }

    this.logger.log(
      `User properties for user ID ${userId} and property ID ${propertyId} updated to have null user`,
    );
    return USER_PROPERTY_RESPONSES.USER_PROPERTIES_UPDATED(userProperties);
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

      const userProperty = await this.propertyRepository.findOne({
        where: { id: propertyId },
      });
      const userPropertyDetails = await this.propertyDetailsRepository.findOne({
        where: { id: propertyId },
      });

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
      await this.propertyRepository.save(userProperty);

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
