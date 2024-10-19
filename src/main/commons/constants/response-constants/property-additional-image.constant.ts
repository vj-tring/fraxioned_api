import { HttpStatus } from '@nestjs/common';
import { PropertyAdditionalImage } from 'src/main/entities/property-additional-image.entity';

export const PROPERTY_ADDITIONAL_IMAGE_RESPONSES = {
  PROPERTY_ADDITIONAL_IMAGES_CREATED: (
    propertyAdditionalImages: PropertyAdditionalImage[],
  ): {
    success: boolean;
    message: string;
    data?: PropertyAdditionalImage[];
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `${propertyAdditionalImages.length} property additional images created successfully`,
    data: propertyAdditionalImages,
    statusCode: HttpStatus.CREATED,
  }),
  PROPERTY_ADDITIONAL_IMAGES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: PropertyAdditionalImage[];
    statusCode: number;
  } => ({
    success: true,
    message: `No property additional images found`,
    data: [],
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_ADDITIONAL_IMAGES_FETCHED: (
    propertyAdditionalImages: PropertyAdditionalImage[],
  ): {
    success: boolean;
    message: string;
    data?: PropertyAdditionalImage[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${propertyAdditionalImages.length} property additional images`,
    data: propertyAdditionalImages,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_ADDITIONAL_IMAGE_NOT_FOUND: (): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Property Additional Image not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_ADDITIONAL_IMAGE_UPDATED: (
    updatedPropertyAdditionalImage: PropertyAdditionalImage,
  ): {
    success: boolean;
    message: string;
    data?: PropertyAdditionalImage;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Additional Image updated successfully`,
    data: updatedPropertyAdditionalImage,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_ADDITIONAL_IMAGE_FETCHED: (
    propertyAdditionalImage: PropertyAdditionalImage,
  ): {
    success: boolean;
    message: string;
    data?: PropertyAdditionalImage;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Space Image retrieved successfully`,
    data: propertyAdditionalImage,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_ADDITIONAL_IMAGE_DELETED: (): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Additional Image deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),

  PROPERTY_ADDITIONAL_IMAGES_DELETED: (): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Additional Images deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
  PROPERTY_ADDITIONAL_IMAGES_NOT_FOUND_FOR_IDS: (
    notFoundIds: number[],
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Property additional images with IDs [${notFoundIds.join(', ')}] not found in the database.`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
};
