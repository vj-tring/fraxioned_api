import { HttpStatus } from '@nestjs/common';
import { Space } from 'src/main/entities/space.entity';

export const SPACE_RESPONSES = {
  SPACES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: 'No spaces are available',
    statusCode: HttpStatus.NO_CONTENT,
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
    message: `Space with name '${spaceName}' already exists`,
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
    message: `Space ${savedSpace.name} created successfully`,
    data: savedSpace,
    statusCode: HttpStatus.CREATED,
  }),
  SPACE_NOT_FOUND: (): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Space not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  SPACE_FETCHED: (
    space: Space,
  ): {
    success: boolean;
    message: string;
    data?: Space;
    statusCode: number;
  } => ({
    success: true,
    message: `Space '${space.name}' retrieved successfully`,
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
    message: `Space '${updatedSpace.name}' updated successfully`,
    data: updatedSpace,
    statusCode: HttpStatus.OK,
  }),
  SPACE_FOREIGN_KEY_CONFLICT: (
    existingSpaceName: string,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Space '${existingSpaceName}' exists and is mapped to property, hence cannot be deleted.`,
    statusCode: HttpStatus.CONFLICT,
  }),
  SPACE_DELETED: (
    existingSpaceName: string,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Space '${existingSpaceName}' deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
};
