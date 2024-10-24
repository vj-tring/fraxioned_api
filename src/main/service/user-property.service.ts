import { Injectable } from '@nestjs/common';
import { LoggerService } from 'services/logger.service';
import { USER_PROPERTY_RESPONSES } from 'src/main/commons/constants/response-constants/user-property.constant';
import { CreateUserPropertyDTO } from '../dto/requests/user-property/create-user-property.dto';
import { UpdateUserPropertyDTO } from '../dto/requests/user-property/update-user-property.dto';
import { UserPropertyDto } from '../dto/requests/user-property/userProperty.dto';
import { UserPropertyRepository } from '../repository/user-property.repository';
import { PropertyRepository } from '../repository/property.repository';
import { UserRepository } from '../repository/user.repository';
import { PropertyDetailsRepository } from '../repository/property-details.repository';
import {
  calculateAvailableNightsForUserByProperty,
  updateAvailableNightsForUserByProperty,
} from '../utils/user-property.util';

@Injectable()
export class UserPropertyService {
  constructor(
    private readonly userPropertyRepository: UserPropertyRepository,
    private readonly userRepository: UserRepository,
    private readonly propertyRepository: PropertyRepository,
    private readonly propertyDetailsRepository: PropertyDetailsRepository,
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

    const existingProperty = await this.propertyRepository.findOne(
      createUserPropertyDto.property.id,
    );
    if (!existingProperty) {
      this.logger.warn(
        `property with ${createUserPropertyDto.property.id} not found`,
      );
      return USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(
        createUserPropertyDto.property.id,
      );
    }

    const isActive = true;
    const existingUserProperty = await this.userPropertyRepository.findOne(
      createUserPropertyDto.user.id,
      createUserPropertyDto.property.id,
      isActive,
    );
    if (existingUserProperty) {
      this.logger.warn(
        `User with user ID ${createUserPropertyDto.user.id}, already has the property ${createUserPropertyDto.property.id}`,
      );
      return USER_PROPERTY_RESPONSES.USER_PROPERTY_ALREADY_EXISTS(
        createUserPropertyDto.user.id,
        user.firstName,
        createUserPropertyDto.property.id,
        existingProperty.propertyName,
      );
    }

    const userPropertyDetails: UserPropertyDto[] = [
      {
        propertyID: createUserPropertyDto.property.id,
        noOfShares: createUserPropertyDto.noOfShare,
        acquisitionDate: createUserPropertyDto.acquisitionDate,
      },
    ];

    const calculatedUserProperties =
      await calculateAvailableNightsForUserByProperty(
        userPropertyDetails,
        createUserPropertyDto.user,
        this.propertyRepository,
        this.propertyDetailsRepository,
        this.userPropertyRepository,
        this.logger,
        null,
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

    const calculatedUserProperties =
      await updateAvailableNightsForUserByProperty(
        userPropertyDetails,
        updateUserPropertyDto.user,
        this.propertyRepository,
        this.propertyDetailsRepository,
        this.userPropertyRepository,
        this.logger,
        existingUserProperties,
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

  async removePropertyForUser(
    userId: number,
    propertyId: number,
  ): Promise<object> {
    const userProperties =
      await this.userPropertyRepository.findUserPropertiesByUserAndProperty(
        userId,
        propertyId,
      );

    if (userProperties.length === 0) {
      this.logger.warn(
        `No user properties found for user ID ${userId} and property ID ${propertyId}`,
      );
      return USER_PROPERTY_RESPONSES.USER_PROPERTIES_NOT_FOUND();
    }

    const property = await this.propertyRepository.findOne(propertyId);
    if (!property) {
      this.logger.error(`Property not found with ID: ${propertyId}`);
      return USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(propertyId);
    }

    try {
      const currentYear = new Date().getFullYear();
      const currentYearProperty = userProperties.find(
        (userProperty) => userProperty.year >= currentYear,
      );

      if (!currentYearProperty) {
        this.logger.error(
          `No user property found for current year ${currentYear}`,
        );
        return USER_PROPERTY_RESPONSES.USER_PROPERTIES_NOT_FOUND();
      }

      const sharesToRestore = currentYearProperty.noOfShare;
      property.propertyRemainingShare += sharesToRestore;

      await this.propertyRepository.saveProperty(property);

      const updatedUserProperties =
        await this.userPropertyRepository.removePropertyForUserByUserId(
          userProperties,
        );

      this.logger.log(
        `User properties for user ID ${userId} and property ID ${propertyId} updated to have null user. Restored ${sharesToRestore} shares from year ${currentYear} to property.`,
      );

      return USER_PROPERTY_RESPONSES.USER_PROPERTIES_UPDATED(
        updatedUserProperties,
      );
    } catch (error) {
      this.logger.error(
        `Error removing property for user and restoring shares: ${error.message}`,
      );
      return USER_PROPERTY_RESPONSES.USER_PROPERTIES_UPDATE_FAILED();
    }
  }
}
