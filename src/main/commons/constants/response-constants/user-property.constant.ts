import { HttpStatus } from '@nestjs/common';
import { UserProperties } from 'entities/user-properties.entity';

interface UserPropertySuccessResponse {
  status: number;
  message: string;
  userProperty?: Partial<UserProperties>;
  userProperties?: Partial<UserProperties[]>;
}

export const USER_PROPERTY_RESPONSES = {
  USER_PROPERTY_ALREADY_EXISTS: (
    userId: number,
    propertyId: number,
    year: number,
  ): { status: number; message: string } => ({
    status: HttpStatus.CONFLICT,
    message: `User property with user ID ${userId}, property ID ${propertyId}, and year ${year} already exists`,
  }),
  USER_PROPERTY_NOT_FOUND: (
    userPropertyId: number,
  ): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `User property with ID ${userPropertyId} not found`,
  }),
  PROPERTY_NOT_FOUND: (
    propertyId: number,
  ): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `Property with ID ${propertyId} not found`,
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
    userProperty: Partial<UserProperties>,
  ): UserPropertySuccessResponse => ({
    status: HttpStatus.CREATED,
    message: 'User property created successfully',
    userProperty,
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
