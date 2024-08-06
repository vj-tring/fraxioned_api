import { HttpStatus } from '@nestjs/common';
import { UserDocument } from 'entities/user-documents.entity';

interface UserDocumentSuccessResponse {
  status: number;
  message: string;
  document?: Partial<UserDocument>;
  documents?: Partial<UserDocument[]>;
}

export const USER_DOCUMENT_RESPONSES = {
  DOCUMENT_NOT_FOUND: (
    documentId: number,
  ): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `Document with ID ${documentId} not found`,
  }),
  DOCUMENTS_NOT_FOUND: (): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `Documents not found`,
  }),
  DOCUMENT_CREATED: (
    document: Partial<UserDocument>,
  ): UserDocumentSuccessResponse => ({
    status: HttpStatus.CREATED,
    message: 'Document created successfully',
    document,
  }),
  DOCUMENT_UPDATED: (
    document: Partial<UserDocument>,
  ): UserDocumentSuccessResponse => ({
    status: HttpStatus.OK,
    message: 'Document updated successfully',
    document,
  }),
  DOCUMENT_DELETED: {
    status: HttpStatus.NOT_FOUND,
    message: 'Document deleted successfully',
  } as { status: number; message: string },
  DOCUMENTS_FETCHED: (
    documents: Partial<UserDocument[]>,
  ): UserDocumentSuccessResponse => ({
    status: HttpStatus.OK,
    message: 'Documents fetched successfully',
    documents,
  }),
  DOCUMENT_FETCHED: (
    document: Partial<UserDocument>,
  ): UserDocumentSuccessResponse => ({
    status: HttpStatus.OK,
    message: 'Document fetched successfully',
    document,
  }),
};
