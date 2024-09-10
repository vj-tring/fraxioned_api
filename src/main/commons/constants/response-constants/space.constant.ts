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
};
