import { HttpStatus } from '@nestjs/common';
import { PropertyCodes } from 'src/main/entities/property-codes.entity';

export const PROPERTY_CODES_RESPONSES = {
  PROPERTY_NOT_FOUND: (
    propertyId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Property with ID ${propertyId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  USER_NOT_FOUND: (
    createdBy: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `User with ID ${createdBy} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_CODE_CATEGORY_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Property code category with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_CODE_CATEGORY_ALREADY_EXISTS: (
    propertyCodeCategoryName: string,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Property code category ${propertyCodeCategoryName} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),

  PROPERTY_CODE_CREATED: (
    savedPropertyCode: PropertyCodes,
  ): {
    success: boolean;
    message: string;
    data: PropertyCodes;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Property Code ${savedPropertyCode.propertyCode} for category ${savedPropertyCode.propertyCodeCategory.name} created successfully`,
    data: savedPropertyCode,
    statusCode: HttpStatus.CREATED,
  }),
  PROPERTY_CODES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: PropertyCodes[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No property codes are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_CODES_FETCHED: (
    propertyCodes: PropertyCodes[],
  ): {
    success: boolean;
    message: string;
    data?: PropertyCodes[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${propertyCodes.length} property codes successfully.`,
    data: propertyCodes,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_CODE_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Property code with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_CODE_FETCHED: (
    propertyCode: PropertyCodes,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertyCodes;
    statusCode: number;
  } => ({
    success: true,
    message: `Property code with ID ${id} retrieved successfully`,
    data: propertyCode,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_CODE_UPDATED: (
    updatedPropertyCode: PropertyCodes,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertyCodes;
    statusCode: number;
  } => ({
    success: true,
    message: `Property code with ID ${id} updated successfully`,
    data: updatedPropertyCode,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_CODE_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Property code with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
};
