import { HttpStatus } from '@nestjs/common';
import { Space } from 'src/main/entities/space.entity';

export const SPACE_RESPONSES = {
  SPACES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: Space[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No spaces are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  SPACES_FETCHED: (
    spaces: Space[],
  ): {
    success: boolean;
    message: string;
    data?: Space[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${spaces.length} spaces successfully.`,
    data: spaces,
    statusCode: HttpStatus.OK,
  }),
  SPACE_ALREADY_EXISTS: (
    spaceName: string,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Space with name ${spaceName} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),
  SPACE_CREATED: (
    savedSpace: Space,
  ): {
    success: boolean;
    message: string;
    data: Space;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Space ${savedSpace.name} created with ID ${savedSpace.id}`,
    data: savedSpace,
    statusCode: HttpStatus.CREATED,
  }),
  SPACE_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Space with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  SPACE_FETCHED: (
    space: Space,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: Space;
    statusCode: number;
  } => ({
    success: true,
    message: `Space with ID ${id} retrieved successfully`,
    data: space,
    statusCode: HttpStatus.OK,
  }),
  SPACE_UPDATED: (
    updatedSpace: Space,
  ): {
    success: boolean;
    message: string;
    data?: Space;
    statusCode: number;
  } => ({
    success: true,
    message: `Space with ID ${updatedSpace.id} updated successfully`,
    data: updatedSpace,
    statusCode: HttpStatus.OK,
  }),
  SPACE_FOREIGN_KEY_CONFLICT: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Space ID ${id} exists and is mapped to property, hence cannot be deleted.`,
    statusCode: HttpStatus.CONFLICT,
  }),
  SPACE_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Space with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
};
