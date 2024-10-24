import { HttpStatus } from '@nestjs/common';
import { UserProperties } from 'entities/user-properties.entity';

interface UserPropertySuccessResponse {
  status: number;
  message: string;
  userProperty?: Partial<UserProperties>;
  userProperties?: Partial<UserProperties>[];
}

export const USER_PROPERTY_RESPONSES = {
  INSUFFICIENT_SHARES: (
    propertyId: number,
    remainingShares: number,
  ): { status: number; message: string } => ({
    status: HttpStatus.BAD_REQUEST,
    message: `Insufficient shares available for property ID ${propertyId}. Remaining shares: ${remainingShares}`,
  }),
  USER_PROPERTIES_UPDATE_FAILED: (): { status: number; message: string } => ({
    status: HttpStatus.BAD_REQUEST,
    message: 'Failed to update user properties',
  }),
  USER_PROPERTY_FOR_USER_NOT_FOUND: (
    userPropertyId: number,
  ): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `User property for user ID ${userPropertyId} not found`,
  }),
  USER_PROPERTIES_UPDATED: (
    userProperties: Partial<UserProperties>[],
  ): UserPropertySuccessResponse => ({
    status: HttpStatus.OK,
    message: 'User properties updated successfully',
    userProperties,
  }),
  USER_PROPERTY_ALREADY_EXISTS: (
    userId: number,
    username: string,
    propertyId: number,
    propertyName: string,
  ): { status: number; message: string } => ({
    status: HttpStatus.CONFLICT,
    message: `User ${username || userId}, already has the property ${propertyName || propertyId}`,
  }),
  USER_PROPERTY_NOT_FOUND: (
    userPropertyId: number,
  ): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `User property with ID ${userPropertyId} not found`,
  }),
  PROPERTY_DETAIL_NOT_FOUND: (
    PropertyDetailId: number,
  ): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `Property detail with propetyID ${PropertyDetailId} not found`,
  }),
  PROPERTY_NOT_FOUND: (
    propertyId: number,
  ): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `Property with ID ${propertyId} not found`,
  }),
  PROPERTIES_NOT_FOUND: (): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `roperties not found`,
  }),
  USER_NOT_FOUND: (userId: number): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `User with ID ${userId} not found`,
  }),
  USER_PROPERTIES_NOT_FOUND: (): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `User properties not found`,
  }),
  USER_PROPERTY_CREATED: (
    userProperties: Partial<UserProperties>[],
  ): UserPropertySuccessResponse => ({
    status: HttpStatus.CREATED,
    message: 'User properties created successfully',
    userProperties,
  }),

  USER_PROPERTY_UPDATED: (
    userProperty: Partial<UserProperties>,
  ): UserPropertySuccessResponse => ({
    status: HttpStatus.OK,
    message: 'User property updated successfully',
    userProperty,
  }),
  USER_PROPERTY_DELETED: {
    status: HttpStatus.NOT_FOUND,
    message: 'User property deleted successfully',
  } as { status: number; message: string },
  USER_PROPERTIES_FETCHED: (
    userProperties: Partial<UserProperties[]>,
  ): UserPropertySuccessResponse => ({
    status: HttpStatus.OK,
    message: 'User properties fetched successfully',
    userProperties,
  }),
  USER_PROPERTY_FETCHED: (
    userProperty: Partial<UserProperties>,
  ): UserPropertySuccessResponse => ({
    status: HttpStatus.OK,
    message: 'User property fetched successfully',
    userProperty,
  }),
};
