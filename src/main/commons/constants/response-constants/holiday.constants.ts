import { HttpStatus } from '@nestjs/common';
import { Holidays } from 'src/main/entities/holidays.entity';

export const HOLIDAYS_RESPONSES = {
  HOLIDAY_ALREADY_EXISTS: (
    holidayName: string,
    holidayYear: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Holiday ${holidayName} for the year ${holidayYear} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),

  USER_NOT_FOUND: (
    createdBy: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `User with ID ${createdBy} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  HOLIDAYS_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: Holidays[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No holidays are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  HOLIDAY_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: Holidays;
    statusCode: number;
  } => ({
    success: false,
    message: `Holiday with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  HOLIDAY_CREATED: (
    savedHoliday: Holidays,
  ): {
    success: boolean;
    message: string;
    data: Holidays;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: 'Holiday created successfully',
    data: savedHoliday,
    statusCode: HttpStatus.CREATED,
  }),
  HOLIDAYS_FETCHED: (
    holidays: Holidays[],
  ): {
    success: boolean;
    message: string;
    data?: Holidays[];
    statusCode: number;
  } => ({
    success: true,
    message: 'Holidays retrieved successfully',
    data: holidays,
    statusCode: HttpStatus.OK,
  }),
  HOLIDAY_FETCHED: (
    holiday: Holidays,
  ): {
    success: boolean;
    message: string;
    data?: Holidays;
    statusCode: number;
  } => ({
    success: true,
    message: 'Holiday retrieved successfully',
    data: holiday,
    statusCode: HttpStatus.OK,
  }),
  HOLIDAY_UPDATED: (
    updatedHoliday: Holidays,
  ): {
    success: boolean;
    message: string;
    data?: Holidays;
    statusCode: number;
  } => ({
    success: true,
    message: 'Holiday updated successfully',
    data: updatedHoliday,
    statusCode: HttpStatus.OK,
  }),
  HOLIDAY_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Holiday with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
  HOLIDAY_FOREIGN_KEY_CONFLICT: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Holiday ID ${id} exists and is mapped to property/properties, hence cannot be deleted.`,
    statusCode: HttpStatus.CONFLICT,
  }),
  PROPERTY_DETAILS_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Property details not found for property with ID ${id}`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTIES_NOT_FOUND: (
    nonExistingIds: number[],
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Properties with ID(s) ${nonExistingIds.join(', ')} do not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_SEASON_HOLIDAY_CREATED: (): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Season Holiday mapping records are created`,
    statusCode: HttpStatus.CREATED,
  }),
};
