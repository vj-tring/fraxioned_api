import { HttpStatus } from '@nestjs/common';
import { PropertyAdditionalImage } from 'src/main/entities/property-additional-image.entity';
import { PropertySpaceImage } from 'src/main/entities/property-space-image.entity';

export const PROPERTY_SPACE_IMAGE_RESPONSES = {
  MISMATCHED_DTO_AND_IMAGES: (): {
    success: boolean;
    message: string;
    statusCode: HttpStatus;
  } => ({
    success: false,
    message: `The number of files does not match the number of property space images in the request`,
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
  IMAGE_UPLOAD_LIMIT_EXCEEDED: (
    maxFileCount: number,
    existingImageCount: number,
  ): {
    success: boolean;
    message: string;
    statusCode: HttpStatus;
  } => ({
    success: false,
    message: `Maximum image upload limit exceeded. Only ${maxFileCount - existingImageCount} image(s) is/are allowed.`,
    statusCode: HttpStatus.BAD_REQUEST,
  }),
  PROPERTY_SPACE_IMAGES_CREATED: (
    propertySpaceImages: PropertySpaceImage[],
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceImage[];
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `${propertySpaceImages.length} property space images created successfully`,
    data: propertySpaceImages,
    statusCode: HttpStatus.CREATED,
  }),
  PROPERTY_SPACE_IMAGES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: PropertySpaceImage[];
    statusCode: number;
  } => ({
    success: true,
    message: `No property space images are found`,
    data: [],
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_IMAGES_NOT_FOUND_FOR_IDS: (
    notFoundIds: number[],
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Property space images with IDs [${notFoundIds.join(', ')}] not found in the database.`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_SPACE_IMAGES_NOT_FOUND_IN_AWS_S3: (
    s3NotFoundKeys: string[],
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `S3 objects with keys [${s3NotFoundKeys.join(', ')}] not found.`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_SPACE_IMAGES_BULK_DELETED: (): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Space Images deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
  PROPERTY_SPACE_IMAGES_FETCHED: (
    propertySpaceImages: PropertySpaceImage[],
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceImage[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${propertySpaceImages.length} property space images`,
    data: propertySpaceImages,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_IMAGE_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceImage;
    statusCode: number;
  } => ({
    success: false,
    message: `Property Space Image with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_SPACE_IMAGE_NOT_FOUND_IN_AWS_S3: (
    s3Key: string,
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceImage;
    statusCode: number;
  } => ({
    success: false,
    message: `Property Space Image with key ${s3Key} not found in S3 bucket`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_SPACE_IMAGE_FETCHED: (
    propertySpaceImage: PropertySpaceImage,
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceImage;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Space Image with ID ${propertySpaceImage.id} retrieved successfully`,
    data: propertySpaceImage,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_IMAGE_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Space Image with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
  PROPERTY_SPACE_IMAGES_DELETED: (
    propertySpaceId: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `All images for Property Space ID ${propertySpaceId} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
  PROPERTY_SPACE_IMAGE_UPDATED: (
    updatedPropertySpaceImage: PropertySpaceImage,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceImage;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Space Image with ID ${id} updated successfully`,
    data: updatedPropertySpaceImage,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_IMAGES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data: {
      propertySpaceImages: PropertySpaceImage[];
      propertyAdditionalImages: PropertyAdditionalImage[];
    };
    statusCode: number;
  } => ({
    success: true,
    message: `No property images are found`,
    data: {
      propertySpaceImages: [],
      propertyAdditionalImages: [],
    },
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_IMAGES_FETCHED: (
    propertySpaceImages: PropertySpaceImage[],
    propertyAdditionalImages: PropertyAdditionalImage[],
  ): {
    success: boolean;
    message: string;
    data: {
      propertySpaceImages: PropertySpaceImage[];
      propertyAdditionalImages: PropertyAdditionalImage[];
    };
    statusCode: number;
  } => ({
    success: true,
    message: `Property images fetched successfully`,
    data: {
      propertySpaceImages,
      propertyAdditionalImages,
    },
    statusCode: HttpStatus.OK,
  }),
};
