import { HttpStatus } from '@nestjs/common';
import { PropertyDocuments } from 'src/main/entities/property-document.entity';

export const PROPERTY_DOCUMENTS_RESPONSES = {
  MISMATCHED_DTO_AND_DOCUMENTS: (): {
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
  PROPERTY_DOCUMENTS_CREATED: (
    propertyImages: PropertyDocuments[],
  ): {
    success: boolean;
    message: string;
    data?: PropertyDocuments[];
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `${propertyImages.length} property images created successfully`,
    data: propertyImages,
    statusCode: HttpStatus.CREATED,
  }),
  PROPERTY_DOCUMENT_NOT_FOUND: (
    documentId: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertyDocuments;
    statusCode: HttpStatus;
  } => ({
    success: false,
    message: `Property document with ID ${documentId} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_DOCUMENT_FETCHED: (
    propertyDocument: PropertyDocuments,
  ): {
    success: boolean;
    message: string;
    data?: PropertyDocuments;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Property document with ID ${propertyDocument.id} retrieved successfully`,
    data: propertyDocument,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_DOCUMENT_DELETED: (
    documentId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: true,
    message: `Property document with ID ${documentId} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
  PROPERTY_DOCUMENT_UPDATED: (
    updatedPropertyDocument: PropertyDocuments,
    documentId: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertyDocuments;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Property document with ID ${documentId} updated successfully`,
    data: updatedPropertyDocument,
    statusCode: HttpStatus.OK,
  }),
  FILE_SIZE_TOO_LARGE: (
    maxFileSize: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `File size exceeds the maximum allowed size of ${maxFileSize} MB`,
    statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
  }),
  UNSUPPORTED_FILE_EXTENSION: (
    allowedExtensions: string[],
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `One or more files have an unsupported extension. Allowed extensions are: ${allowedExtensions.join(', ')}`,
    statusCode: HttpStatus.BAD_REQUEST,
  }),
  DOCUMENT_NOT_FOUND_IN_AWS_S3: (
    s3Key: string,
  ): {
    success: boolean;
    message: string;
    data?: PropertyDocuments;
    statusCode: HttpStatus;
  } => ({
    success: false,
    message: `Document with key ${s3Key} not found in S3 bucket`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  FILE_NOT_PROVIDED: (): {
    success: boolean;
    message: string;
    statusCode: HttpStatus;
  } => ({
    success: false,
    message: 'No file was provided',
    statusCode: HttpStatus.BAD_REQUEST,
  }),
};
