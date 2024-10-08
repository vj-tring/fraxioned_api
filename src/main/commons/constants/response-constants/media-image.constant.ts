import { HttpStatus } from '@nestjs/common';
import { MediaImage } from 'src/main/entities/media-image.entity';

export const MEDIA_IMAGE_RESPONSES = {
  MISMATCHED_DTO_AND_IMAGES: (): {
    success: boolean;
    message: string;
    statusCode: HttpStatus;
  } => ({
    success: false,
    message: `The number of files does not match the number of images in the request`,
    statusCode: HttpStatus.BAD_REQUEST,
  }),
  FILE_SIZE_TOO_LARGE: (
    max_file_size: number,
  ): {
    success: boolean;
    message: string;
    statusCode: HttpStatus;
  } => ({
    success: false,
    message: `File size exceeds the maximum allowed size of ${max_file_size} MB`,
    statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
  }),
  UNSUPPORTED_FILE_EXTENSION: (
    allowedExtensions: string[],
  ): {
    success: boolean;
    message: string;
    statusCode: HttpStatus;
  } => ({
    success: false,
    message: `One or more files have an unsupported extension. Allowed extensions are: ${allowedExtensions.join(', ')}`,
    statusCode: HttpStatus.BAD_REQUEST,
  }),
  ENTITY_NOT_FOUND: (
    entityName: string,
    entityId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `${entityName} with ID ${entityId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  MEDIA_IMAGES_CREATED: (
    mediaImages: MediaImage[],
  ): {
    success: boolean;
    message: string;
    data?: MediaImage[];
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `${mediaImages.length} media images created successfully`,
    data: mediaImages,
    statusCode: HttpStatus.CREATED,
  }),
  MEDIA_IMAGES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: MediaImage[];
    statusCode: number;
  } => ({
    success: true,
    message: `No media images are found`,
    data: [],
    statusCode: HttpStatus.OK,
  }),
  MEDIA_IMAGES_FETCHED: (
    mediaImages: MediaImage[],
  ): {
    success: boolean;
    message: string;
    data?: MediaImage[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${mediaImages.length} media images`,
    data: mediaImages,
    statusCode: HttpStatus.OK,
  }),
  MEDIA_IMAGE_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: MediaImage;
    statusCode: number;
  } => ({
    success: false,
    message: `Media Image with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  MEDIA_IMAGE_NOT_FOUND_IN_AWS_S3: (
    s3Key: string,
  ): {
    success: boolean;
    message: string;
    data?: MediaImage;
    statusCode: number;
  } => ({
    success: false,
    message: `Image with key ${s3Key} not found in S3 bucket`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  MEDIA_IMAGE_FETCHED: (
    mediaImage: MediaImage,
  ): {
    success: boolean;
    message: string;
    data?: MediaImage;
    statusCode: number;
  } => ({
    success: true,
    message: `Media Image with ID ${mediaImage.id} retrieved successfully`,
    data: mediaImage,
    statusCode: HttpStatus.OK,
  }),
  MEDIA_IMAGE_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Media Image with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
  MEDIA_IMAGE_UPDATED: (
    updatedMediaImage: MediaImage,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: MediaImage;
    statusCode: number;
  } => ({
    success: true,
    message: `Media Image with ID ${id} updated successfully`,
    data: updatedMediaImage,
    statusCode: HttpStatus.OK,
  }),
};
