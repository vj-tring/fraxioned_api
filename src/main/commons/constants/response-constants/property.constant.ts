import { HttpStatus } from '@nestjs/common';

export const PROPERTY_RESPONSES = {
  PROPERTY_NOT_FOUND: (
    propertyId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Property with ID ${propertyId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_CREATED: (
    propertyId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: true,
    message: `Property with ID ${propertyId} created successfully`,
    statusCode: HttpStatus.CREATED,
  }),
  PROPERTY_UPDATED: (
    propertyId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: true,
    message: `Property with ID ${propertyId} updated successfully`,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_DELETED: (
    propertyId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: true,
    message: `Property with ID ${propertyId} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
};
