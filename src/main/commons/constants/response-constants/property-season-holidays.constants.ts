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
  PROPERTY_SEASON_HOLIDAYS_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: PropertySeasonHolidays[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No property season holidays are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SEASON_HOLIDAYS_FETCHED: (
    propertySeasonHolidays: PropertySeasonHolidays[],
  ): {
    success: boolean;
    message: string;
    data?: PropertySeasonHolidays[];
    statusCode: number;
  } => ({
    success: true,
    message: 'Property season holidays retrieved successfully',
    data: propertySeasonHolidays,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SEASON_HOLIDAY_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertySeasonHolidays;
    statusCode: number;
  } => ({
    success: false,
    message: `Property Season Holiday with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_SEASON_HOLIDAY_FETCHED: (
    propertySeasonHoliday: PropertySeasonHolidays,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertySeasonHolidays;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Season Holiday with ID ${id} retrieved successfully`,
    data: propertySeasonHoliday,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SEASON_HOLIDAY_UPDATED: (
    updatedPropertySeasonHoliday: PropertySeasonHolidays,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertySeasonHolidays;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Season Holiday with ID ${id} updated successfully`,
    data: updatedPropertySeasonHoliday,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SEASON_HOLIDAY_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Season Holiday with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
};
