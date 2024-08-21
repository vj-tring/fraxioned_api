import { HttpStatus } from '@nestjs/common';

export const PROPERTY_IMAGES_RESPONSES = {
  IMAGE_FILES_LENGTH_MISMATCH: (): {
    success: boolean;
    message: string;
    statusCode: HttpStatus;
  } => ({
    success: false,
    message: `The number of files does not match the number of images in the request`,
    statusCode: HttpStatus.BAD_REQUEST,
  }),
};
