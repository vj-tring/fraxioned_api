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
};
