import { HttpStatus } from '@nestjs/common';

export const PROPERTY_RESPONSES = {
  PROPERTY_NOT_FOUND: (
    propertyId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Property with ID ${propertyId} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
};
