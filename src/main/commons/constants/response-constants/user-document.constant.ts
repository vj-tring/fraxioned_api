import { HttpStatus } from '@nestjs/common';
import { UserPropertyDocument } from 'src/main/entities/user-property-document.entity';

export const USER_PROPERTY_DOCUMENT_RESPONSES = {
  MISMATCHED_DTO_AND_DOCUMENTS: (): {
    success: boolean;
    message: string;
    statusCode: HttpStatus;
  } => ({
    success: false,
    message: `The number of files does not match the number of documents in the request`,
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
    userId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `User with ID ${userId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),

  USER_PROPERTY_DOCUMENTS_CREATED: (
    userPropertyDocuments: UserPropertyDocument[],
  ): {
    success: boolean;
    message: string;
    data?: UserPropertyDocument[];
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `${userPropertyDocuments.length} user property documents created successfully`,
    data: userPropertyDocuments,
    statusCode: HttpStatus.CREATED,
  }),

  USER_PROPERTY_DOCUMENT_NOT_FOUND: (
    documentId: number,
  ): {
    success: boolean;
    message: string;
    data?: UserPropertyDocument;
    statusCode: HttpStatus;
  } => ({
    success: false,
    message: `User property document with ID ${documentId} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),

  USER_PROPERTY_DOCUMENT_FETCHED: (
    userPropertyDocument: UserPropertyDocument,
  ): {
    success: boolean;
    message: string;
    data?: UserPropertyDocument;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `User property document with ID ${userPropertyDocument.id} retrieved successfully`,
    data: userPropertyDocument,
    statusCode: HttpStatus.OK,
  }),

  USER_PROPERTY_DOCUMENT_DELETED: (
    documentId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: true,
    message: `User property document with ID ${documentId} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),

  USER_PROPERTY_DOCUMENT_UPDATED: (
    updatedUserPropertyDocument: UserPropertyDocument,
    documentId: number,
  ): {
    success: boolean;
    message: string;
    data?: UserPropertyDocument;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `User property document with ID ${documentId} updated successfully`,
    data: updatedUserPropertyDocument,
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

  USER_PROPERTY_DOCUMENT_NOT_FOUND_IN_AWS_S3: (
    s3Key: string,
  ): {
    success: boolean;
    message: string;
    data?: UserPropertyDocument;
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

  USER_PROPERTY_DOCUMENTS_FETCHED: (
    userPropertyDocuments: UserPropertyDocument[],
  ): {
    success: boolean;
    message: string;
    data?: UserPropertyDocument[];
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Retrieved ${userPropertyDocuments.length} user property documents successfully`,
    data: userPropertyDocuments,
    statusCode: HttpStatus.OK,
  }),

  USER_PROPERTY_DOCUMENTS_NOT_FOUND: (): {
    success: boolean;
    message: string;
    statusCode: HttpStatus;
  } => ({
    success: false,
    message: 'No user property documents found',
    statusCode: HttpStatus.NOT_FOUND,
  }),
};
