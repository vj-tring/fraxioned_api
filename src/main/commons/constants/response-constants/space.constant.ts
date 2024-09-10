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
    message: `Space ${spaceName} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),
  USER_NOT_FOUND: (
    createdBy: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `User with ID ${createdBy} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
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
};
