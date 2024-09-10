import { HttpStatus } from '@nestjs/common';
import { SpaceTypes } from 'src/main/entities/space-types.entity';

export const SPACE_TYPES_RESPONSES = {
  SPACE_TYPES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: SpaceTypes[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No space types are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  SPACE_TYPES_FETCHED: (
    spaceTypes: SpaceTypes[],
  ): {
    success: boolean;
    message: string;
    data?: SpaceTypes[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${spaceTypes.length} space types successfully.`,
    data: spaceTypes,
    statusCode: HttpStatus.OK,
  }),
  SPACE_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: SpaceTypes;
    statusCode: number;
  } => ({
    success: false,
    message: `Space with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  SPACE_TYPE_ALREADY_EXISTS: (
    spaceTypeName: string,
    spaceId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Space Type ${spaceTypeName} with Space ID ${spaceId} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),
  SPACE_TYPE_CREATED: (
    spaceTypeName: string,
    spaceId: number,
    savedSpaceType: SpaceTypes,
  ): {
    success: boolean;
    message: string;
    data: SpaceTypes;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Space Type ${spaceTypeName} for space ID ${spaceId} created successfully`,
    data: savedSpaceType,
    statusCode: HttpStatus.CREATED,
  }),
};
