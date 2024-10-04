import { HttpStatus } from '@nestjs/common';
import { SpaceBedType } from 'src/main/entities/space-bed-type.entity';

export const SPACE_BED_TYPE_RESPONSES = {
  SPACE_BED_TYPE_ALREADY_EXISTS: (
    bedType: string,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Space bed type '${bedType}' already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),
  SPACE_BED_TYPE_CREATED: (
    savedSpaceBedType: SpaceBedType,
  ): {
    success: boolean;
    message: string;
    data: SpaceBedType;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Space bed type '${savedSpaceBedType.bedType}' created with ID ${savedSpaceBedType.id}`,
    data: savedSpaceBedType,
    statusCode: HttpStatus.CREATED,
  }),
  SPACE_BED_TYPES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: SpaceBedType[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No space bed types are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  SPACE_BED_TYPES_FETCHED: (
    spaceBedTypes: SpaceBedType[],
  ): {
    success: boolean;
    message: string;
    data?: SpaceBedType[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${spaceBedTypes.length} space bed types successfully.`,
    data: spaceBedTypes,
    statusCode: HttpStatus.OK,
  }),
  SPACE_BED_TYPE_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Space bed type with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  SPACE_BED_TYPE_FETCHED: (
    existingSpaceBedType: SpaceBedType,
  ): {
    success: boolean;
    message: string;
    data?: SpaceBedType;
    statusCode: number;
  } => ({
    success: true,
    message: `Space bed type with ID ${existingSpaceBedType.id} retrieved successfully`,
    data: existingSpaceBedType,
    statusCode: HttpStatus.OK,
  }),
  SPACE_BED_TYPE_UPDATED: (
    updatedSpaceBedType: SpaceBedType,
  ): {
    success: boolean;
    message: string;
    data?: SpaceBedType;
    statusCode: number;
  } => ({
    success: true,
    message: `Space bed type with ID ${updatedSpaceBedType.id} updated successfully`,
    data: updatedSpaceBedType,
    statusCode: HttpStatus.OK,
  }),
  SPACE_BED_TYPE_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Space bed type with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
};
