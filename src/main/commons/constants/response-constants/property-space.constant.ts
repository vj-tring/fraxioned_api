import { HttpStatus } from '@nestjs/common';
import { PropertySpace } from 'src/main/entities/property-space.entity';

export const PROPERTY_SPACE_RESPONSES = {
  PROPERTY_SPACE_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Property space with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_SPACE_FETCHED: (
    existingPropertySpace: PropertySpace,
  ): {
    success: boolean;
    message: string;
    data?: PropertySpace;
    statusCode: number;
  } => ({
    success: true,
    message: `Property space with ID ${existingPropertySpace.id} retrieved successfully`,
    data: existingPropertySpace,
    statusCode: HttpStatus.OK,
  }),
};
