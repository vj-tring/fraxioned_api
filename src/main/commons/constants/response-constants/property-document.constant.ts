import { HttpStatus } from '@nestjs/common';
import { PropertyDocuments } from 'src/main/entities/property-document.entity';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
}

export const PROPERTY_DOCUMENTS_RESPONSES = {
  MISMATCHED_DTO_AND_DOCUMENTS: (): ApiResponse<null> => ({
    success: false,
    message: `The number of files does not match the number of documents in the request`,
    statusCode: HttpStatus.BAD_REQUEST,
  }),
  PROPERTY_NOT_FOUND: (propertyId: number): ApiResponse<null> => ({
    success: false,
    message: `Property with ID ${propertyId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  USER_NOT_FOUND: (createdByUserId: number): ApiResponse<null> => ({
    success: false,
    message: `User with ID ${createdByUserId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_DOCUMENTS_CREATED: (
    propertyDocuments: PropertyDocuments[],
  ): ApiResponse<PropertyDocuments[]> => ({
    success: true,
    message: `${propertyDocuments.length} property documents created successfully`,
    data: propertyDocuments,
    statusCode: HttpStatus.CREATED,
  }),
  PROPERTY_DOCUMENT_NOT_FOUND: (documentId: number): ApiResponse<null> => ({
    success: false,
    message: `Property document with ID ${documentId} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_DOCUMENT_FETCHED: (
    propertyDocument: PropertyDocuments,
  ): ApiResponse<PropertyDocuments> => ({
    success: true,
    message: `Property document with ID ${propertyDocument.id} retrieved successfully`,
    data: propertyDocument,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_DOCUMENT_DELETED: (documentId: number): ApiResponse<null> => ({
    success: true,
    message: `Property document with ID ${documentId} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
  PROPERTY_DOCUMENT_UPDATED: (
    updatedPropertyDocument: PropertyDocuments,
    documentId: number,
  ): ApiResponse<PropertyDocuments> => ({
    success: true,
    message: `Property document with ID ${documentId} updated successfully`,
    data: updatedPropertyDocument,
    statusCode: HttpStatus.OK,
  }),
  FILE_SIZE_TOO_LARGE: (maxFileSize: number): ApiResponse<null> => ({
    success: false,
    message: `File size exceeds the maximum allowed size of ${maxFileSize} MB`,
    statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
  }),
  UNSUPPORTED_FILE_EXTENSION: (
    allowedExtensions: string[],
  ): ApiResponse<null> => ({
    success: false,
    message: `One or more files have an unsupported extension. Allowed extensions are: ${allowedExtensions.join(', ')}`,
    statusCode: HttpStatus.BAD_REQUEST,
  }),
  PROPERTY_DOCUMENT_NOT_FOUND_IN_AWS_S3: (
    s3Key: string,
  ): ApiResponse<null> => ({
    success: false,
    message: `Document with key ${s3Key} not found in S3 bucket`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_DOCUMENTS_NOT_FOUND_IN_AWS_S3: (
    s3NotFoundKeys: string[],
  ): ApiResponse<null> => ({
    success: false,
    message: `S3 objects with keys [${s3NotFoundKeys.join(', ')}] not found.`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  FILE_NOT_PROVIDED: (): ApiResponse<null> => ({
    success: false,
    message: 'No file was provided',
    statusCode: HttpStatus.BAD_REQUEST,
  }),
  PROPERTY_DOCUMENTS_FETCHED: (
    propertyDocuments: PropertyDocuments[],
  ): ApiResponse<PropertyDocuments[]> => ({
    success: true,
    message: `Retrieved ${propertyDocuments.length} property documents successfully`,
    data: propertyDocuments,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_DOCUMENTS_NOT_FOUND: (): ApiResponse<null> => ({
    success: false,
    message: 'No property documents found',
    statusCode: HttpStatus.NOT_FOUND,
  }),
  DOCUMENT_UPLOAD_LIMIT_EXCEEDED: (
    maxFileCount: number,
    existingDocumentCount: number,
  ): ApiResponse<null> => ({
    success: false,
    message: `Maximum document upload limit exceeded. Only ${maxFileCount - existingDocumentCount} document(s) is/are allowed.`,
    statusCode: HttpStatus.BAD_REQUEST,
  }),
  PROPERTY_DOCUMENTS_NOT_FOUND_FOR_IDS: (ids: number[]): ApiResponse<null> => ({
    success: false,
    message: `No property documents found for IDs: ${ids.join(', ')}`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_DOCUMENTS_BULK_DELETED: (): ApiResponse<null> => ({
    success: true,
    message: `Property documents deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
};
