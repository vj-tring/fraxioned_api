import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  HttpException,
  HttpStatus,
  UseGuards,
  Get,
  Param,
  Delete,
  Patch,
  UploadedFile,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { UserPropertyDocument } from '../entities/user-property-document.entity';

import {
  getMaxFileSize,
  isFileSizeValid,
  isFileExtensionValid,
  getAllowedDocumentExtensions,
  getMaxFileCount,
} from '../utils/image-file.utils';
import {
  CreateUserPropertyDocumentsRequestDto,
  CreateUserPropertyDocumentDto,
} from '../dto/requests/user-property-document/create-user-document.dto';
import {
  UpdateUserPropertyDocumentRequestDto,
  UpdateUserPropertyDocumentDto,
} from '../dto/requests/user-property-document/update-user-document.dto';
import { UserPropertyDocumentsService } from '../service/user-property-document.service';
import { USER_PROPERTY_DOCUMENT_RESPONSES } from '../commons/constants/response-constants/user-document.constant';

@ApiTags('User Property Documents')
@Controller('v1/userPropertyDocuments')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class UserPropertyDocumentsController {
  constructor(
    private readonly userPropertyDocumentsService: UserPropertyDocumentsService,
  ) {}

  @Post('userPropertyDocument')
  @UseInterceptors(FilesInterceptor('documentFiles', getMaxFileCount()))
  async createUserPropertyDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @Body()
    createUserPropertyDocumentsRequestDto: CreateUserPropertyDocumentsRequestDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: UserPropertyDocument[];
    statusCode: HttpStatus;
  }> {
    try {
      const max_file_size = getMaxFileSize();
      const allowedExtensions = getAllowedDocumentExtensions();

      const hasOversizedFile = files.some(
        (file) => !isFileSizeValid(file, max_file_size),
      );

      if (hasOversizedFile) {
        return USER_PROPERTY_DOCUMENT_RESPONSES.FILE_SIZE_TOO_LARGE(
          max_file_size,
        );
      }

      const hasUnsupportedExtension = files.some(
        (file) => !isFileExtensionValid(file, allowedExtensions),
      );

      if (hasUnsupportedExtension) {
        return USER_PROPERTY_DOCUMENT_RESPONSES.UNSUPPORTED_FILE_EXTENSION(
          allowedExtensions,
        );
      }

      const userPropertyDocumentDetails: CreateUserPropertyDocumentDto[] =
        JSON.parse(createUserPropertyDocumentsRequestDto.userPropertyDocuments);

      if (userPropertyDocumentDetails.length !== files.length) {
        return USER_PROPERTY_DOCUMENT_RESPONSES.MISMATCHED_DTO_AND_DOCUMENTS();
      }

      const processedUserPropertyDocumentsDtos =
        userPropertyDocumentDetails.map((dto, index) => ({
          ...dto,
          documentFile: files[index],
        }));

      const result =
        await this.userPropertyDocumentsService.createUserPropertyDocuments(
          processedUserPropertyDocumentsDtos,
        );
      return result;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpException(
          `Invalid request body format. Please provide a valid JSON string for userPropertyDocuments.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'An error occurred while creating the user property documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllUserPropertyDocuments(): Promise<{
    success: boolean;
    message: string;
    data?: UserPropertyDocument[];
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.userPropertyDocumentsService.findAllUserPropertyDocuments();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all user property documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  async getUserPropertyDocumentsByUserId(
    @Param('userId') userId: number,
  ): Promise<{
    success: boolean;
    message: string;
    data?: UserPropertyDocument[];
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.userPropertyDocumentsService.findUserPropertyDocumentsByUserId(
          userId,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving user property documents by user id',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('userPropertyDocument/:id')
  async getByUserPropertyDocumentId(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: UserPropertyDocument;
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.userPropertyDocumentsService.findUserPropertyDocumentById(
          id,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the user property document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('userPropertyDocument/:id')
  @UseInterceptors(FileInterceptor('documentFile'))
  async updateUserPropertyDocumentId(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    updateUserPropertyDocumentRequestDto: UpdateUserPropertyDocumentRequestDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: UserPropertyDocument;
    statusCode: HttpStatus;
  }> {
    try {
      const updateUserPropertyDocumentDto: UpdateUserPropertyDocumentDto =
        JSON.parse(updateUserPropertyDocumentRequestDto.userPropertyDocument);

      if (
        (file && !updateUserPropertyDocumentDto) ||
        (!file && updateUserPropertyDocumentDto)
      ) {
        return USER_PROPERTY_DOCUMENT_RESPONSES.MISMATCHED_DTO_AND_DOCUMENTS();
      }

      const max_file_size = getMaxFileSize();
      const allowedExtensions = getAllowedDocumentExtensions();

      if (file) {
        if (!isFileSizeValid(file, max_file_size)) {
          return USER_PROPERTY_DOCUMENT_RESPONSES.FILE_SIZE_TOO_LARGE(
            max_file_size,
          );
        }

        if (!isFileExtensionValid(file, allowedExtensions)) {
          return USER_PROPERTY_DOCUMENT_RESPONSES.UNSUPPORTED_FILE_EXTENSION(
            allowedExtensions,
          );
        }
      }

      updateUserPropertyDocumentDto.documentFile = file;
      const result =
        await this.userPropertyDocumentsService.updateUserPropertyDocumentDetail(
          id,
          updateUserPropertyDocumentDto,
        );
      return result;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpException(
          `Invalid request body format. Please provide a valid JSON string for userPropertyDocument.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'An error occurred while updating the user property document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('userPropertyDocument/:id')
  async deleteUserPropertyDocument(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result =
        await this.userPropertyDocumentsService.deleteUserPropertyDocumentById(
          id,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the user property document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
