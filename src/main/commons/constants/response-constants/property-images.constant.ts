import { HttpStatus } from '@nestjs/common';
import { PropertyImages } from 'src/main/entities/property_images.entity';

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
  PROPERTY_NOT_FOUND: (
    propertyId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Property with ID ${propertyId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  USER_NOT_FOUND: (
    createdByUserId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `User with ID ${createdByUserId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  MULTIPLE_SPACE_TYPES_NOT_FOUND: (
    invalidSpaceTypeIds: number[],
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Invalid Space Type IDs: ${invalidSpaceTypeIds.join(', ')}`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  SPACE_NOT_FOUND: (
    spaceId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Space with ID ${spaceId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_IMAGES_CREATED: (
    propertyImagesLength: number,
  ): {
    success: boolean;
    message: string;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `${propertyImagesLength} property images created successfully`,
    statusCode: HttpStatus.CREATED,
  }),
  PROPERTY_IMAGES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: PropertyImages[];
    statusCode: number;
  } => ({
    success: true,
    message: `No property images are found`,
    data: [],
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_IMAGES_FETCHED: (
    propertyImages: PropertyImages[],
  ): {
    success: boolean;
    message: string;
    data?: PropertyImages[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${propertyImages.length} property images`,
    data: propertyImages,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_IMAGE_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertyImages;
    statusCode: number;
  } => ({
    success: false,
    message: `Property Image with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_IMAGE_FETCHED: (
    propertyImage: PropertyImages,
  ): {
    success: boolean;
    message: string;
    data?: PropertyImages;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Image with ID ${propertyImage.id} retrieved successfully`,
    data: propertyImage,
    statusCode: HttpStatus.OK,
  }),
};
