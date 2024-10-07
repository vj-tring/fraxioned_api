import { HttpStatus } from '@nestjs/common';
import { PropertySpaceBathroom } from 'src/main/entities/property-space-bathroom.entity';

export const PROPERTY_SPACE_BATHROOM_RESPONSES = {
  PROPERTY_SPACE_BATHROOMS_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: PropertySpaceBathroom[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No space bathroom types are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_BATHROOMS_FETCHED: (
    propertySpaceBathroom: PropertySpaceBathroom[],
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceBathroom[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${propertySpaceBathroom.length} space bathroom types successfully.`,
    data: propertySpaceBathroom,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_BATHROOM_ALREADY_EXISTS: (
    spaceBathroomTypeId: number,
    spaceInstanceId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Property space bathroom foreign ids ${spaceBathroomTypeId}, ${spaceInstanceId} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),
  PROPERTY_SPACE_BATHROOM_CREATED: (
    savedSpaceBathroomType: PropertySpaceBathroom,
  ): {
    success: boolean;
    message: string;
    data: PropertySpaceBathroom;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Property space bathroom created with ID ${savedSpaceBathroomType.id}`,
    data: savedSpaceBathroomType,
    statusCode: HttpStatus.CREATED,
  }),
  PROPERTY_SPACE_BATHROOM_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceBathroom;
    statusCode: number;
  } => ({
    success: false,
    message: `Space bathroom type with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_SPACE_BATHROOM_FETCHED: (
    spaceBathroomType: PropertySpaceBathroom,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceBathroom;
    statusCode: number;
  } => ({
    success: true,
    message: `Space bathroom type with ID ${id} retrieved successfully`,
    data: spaceBathroomType,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_BATHROOM_UPDATED: (
    updatedSpaceBathroomType: PropertySpaceBathroom,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceBathroom;
    statusCode: number;
  } => ({
    success: true,
    message: `Space bathroom type with ID ${id} updated successfully`,
    data: updatedSpaceBathroomType,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_BATHROOM_FOREIGN_KEY_CONFLICT: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Space bathroom type ID ${id} exists and is mapped to space type, hence cannot be deleted.`,
    statusCode: HttpStatus.CONFLICT,
  }),
  PROPERTY_SPACE_BATHROOM_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Space bathroom type with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
};
