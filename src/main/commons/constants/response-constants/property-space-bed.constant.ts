import { HttpStatus } from '@nestjs/common';
import { PropertySpaceBed } from 'src/main/entities/property-space-bed.entity';

export const PROPERTY_SPACE_BED_RESPONSES = {
  PROPERTY_SPACE_BED_CREATED: (
    savedPropertySpaceBed: PropertySpaceBed,
  ): {
    success: boolean;
    message: string;
    data: PropertySpaceBed;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Property space bed created with ID ${savedPropertySpaceBed.id}`,
    data: savedPropertySpaceBed,
    statusCode: HttpStatus.CREATED,
  }),
  PROPERTY_SPACE_BEDS_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: PropertySpaceBed[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No property space beds are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_BEDS_FETCHED: (
    propertySpaceBeds: PropertySpaceBed[],
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceBed[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${propertySpaceBeds.length} property space beds successfully.`,
    data: propertySpaceBeds,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_BED_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Property space bed with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_SPACE_BED_FETCHED: (
    existingPropertySpaceBed: PropertySpaceBed,
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceBed;
    statusCode: number;
  } => ({
    success: true,
    message: `Property space bed with ID ${existingPropertySpaceBed.id} retrieved successfully`,
    data: existingPropertySpaceBed,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_BED_UPDATED: (
    updatedPropertySpaceBed: PropertySpaceBed,
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceBed;
    statusCode: number;
  } => ({
    success: true,
    message: `Property space bed with ID ${updatedPropertySpaceBed.id} updated successfully`,
    data: updatedPropertySpaceBed,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_BED_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Property space bed with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
};
