import { HttpStatus } from '@nestjs/common';
import { SpaceBathroomTypes } from 'src/main/entities/space-bathroom-types.entity';

export const SPACE_BATHROOM_TYPES_RESPONSES = {
  SPACE_BATHROOM_TYPES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: SpaceBathroomTypes[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No space bathroom types are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  SPACE_BATHROOM_TYPES_FETCHED: (
    spaceBathroomTypes: SpaceBathroomTypes[],
  ): {
    success: boolean;
    message: string;
    data?: SpaceBathroomTypes[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${spaceBathroomTypes.length} space bathroom types successfully.`,
    data: spaceBathroomTypes,
    statusCode: HttpStatus.OK,
  }),
  SPACE_BATHROOM_TYPE_ALREADY_EXISTS: (
    spaceBathroomTypeName: string,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Space bathroom type ${spaceBathroomTypeName} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),
  SPACE_BATHROOM_TYPE_CREATED: (
    savedSpaceBathroomType: SpaceBathroomTypes,
  ): {
    success: boolean;
    message: string;
    data: SpaceBathroomTypes;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Space bathroom type ${savedSpaceBathroomType.name} created with ID ${savedSpaceBathroomType.id}`,
    data: savedSpaceBathroomType,
    statusCode: HttpStatus.CREATED,
  }),
  SPACE_BATHROOM_TYPE_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: SpaceBathroomTypes;
    statusCode: number;
  } => ({
    success: false,
    message: `Space bathroom type with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  SPACE_BATHROOM_TYPE_FETCHED: (
    spaceBathroomType: SpaceBathroomTypes,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: SpaceBathroomTypes;
    statusCode: number;
  } => ({
    success: true,
    message: `Space bathroom type with ID ${id} retrieved successfully`,
    data: spaceBathroomType,
    statusCode: HttpStatus.OK,
  }),
  SPACE_BATHROOM_TYPE_UPDATED: (
    updatedSpaceBathroomType: SpaceBathroomTypes,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: SpaceBathroomTypes;
    statusCode: number;
  } => ({
    success: true,
    message: `Space bathroom type with ID ${id} updated successfully`,
    data: updatedSpaceBathroomType,
    statusCode: HttpStatus.OK,
  }),
  SPACE_BATHROOM_TYPE_FOREIGN_KEY_CONFLICT: (
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
  SPACE_BATHROOM_TYPE_DELETED: (
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
