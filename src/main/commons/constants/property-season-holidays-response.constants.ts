import { HttpStatus } from '@nestjs/common';
import { PropertySeasonHolidays } from 'src/main/entities/property-season-holidays.entity';

export const PROPERTY_SEASON_HOLIDAY_RESPONSES = {
  PROPERTY_NOT_FOUND: (
    propertyId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Property with ID ${propertyId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  HOLIDAY_NOT_FOUND: (
    holidayId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Holiday with ID ${holidayId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  USER_NOT_FOUND: (
    userId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `User with ID ${userId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_SEASON_HOLIDAY_ALREADY_EXISTS: (
    propertyId: number,
    holidayId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Property ID ${propertyId} with Holiday ID ${holidayId} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),
  PROPERTY_SEASON_HOLIDAY_CREATED: (
    savedPropertySeasonHoliday: PropertySeasonHolidays,
  ): {
    success: boolean;
    message: string;
    data: PropertySeasonHolidays;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Property Season Holiday created successfully`,
    data: savedPropertySeasonHoliday,
    statusCode: HttpStatus.CREATED,
  }),
  // ROLE_UPDATED: (role: Partial<Role>): RoleSuccessResponse => ({
  //   status: HttpStatus.OK,
  //   message: 'Role updated successfully',
  //   role,
  // }),
  // ROLE_DELETED: {
  //   status: HttpStatus.OK,
  //   message: 'Role deleted successfully',
  // } as { status: number; message: string },
  // ROLES_FETCHED: (roles: Partial<Role[]>): RoleSuccessResponse => ({
  //   status: HttpStatus.OK,
  //   message: 'Roles fetched successfully',
  //   roles,
  // }),
  // ROLE_FETCHED: (role: Partial<Role>): RoleSuccessResponse => ({
  //   status: HttpStatus.OK,
  //   message: 'Role fetched successfully',
  //   role,
  // }),
};
