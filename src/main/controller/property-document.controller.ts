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
import { PropertyDocuments } from '../entities/property-document.entity';
import { PropertyDocumentsService } from '../service/property-document.service';
import { PROPERTY_DOCUMENTS_RESPONSES } from '../commons/constants/response-constants/property-document.constant';
import {
  getMaxFileSize,
  isFileSizeValid,
  isFileExtensionValid,
  getAllowedDocumentExtensions,
  getMaxFileCount,
} from '../utils/image-file.utils';
import {
  CreatePropertyDocumentsRequestDto,
  CreatePropertyDocumentsDto,
} from '../dto/requests/property-document/create-property-document.dto';
import {
  UpdatePropertyDocumentDto,
  UpdatePropertyDocumentRequestDto,
} from '../dto/requests/property-document/update-property-document.dto';

@ApiTags('Property Documents')
@Controller('v1/propertyDocuments')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertyDocumentsController {
  constructor(
    private readonly propertyDocumentsService: PropertyDocumentsService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('documentFiles', getMaxFileCount()))
  async createPropertyDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @Body()
    createPropertyDocumentsRequestDto: CreatePropertyDocumentsRequestDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyDocuments[];
    statusCode: HttpStatus;
  }> {
    try {
      const max_file_size = getMaxFileSize();
      const allowedExtensions = getAllowedDocumentExtensions();

      const hasOversizedFile = files.some(
        (file) => !isFileSizeValid(file, max_file_size),
      );

      if (hasOversizedFile) {
        return PROPERTY_DOCUMENTS_RESPONSES.FILE_SIZE_TOO_LARGE(max_file_size);
      }

      const hasUnsupportedExtension = files.some(
        (file) => !isFileExtensionValid(file, allowedExtensions),
      );

      if (hasUnsupportedExtension) {
        return PROPERTY_DOCUMENTS_RESPONSES.UNSUPPORTED_FILE_EXTENSION(
          allowedExtensions,
        );
      }

      const propertyDocumentDetails: CreatePropertyDocumentsDto[] = JSON.parse(
        createPropertyDocumentsRequestDto.propertyDocuments,
      );

      if (propertyDocumentDetails.length !== files.length) {
        return PROPERTY_DOCUMENTS_RESPONSES.MISMATCHED_DTO_AND_DOCUMENTS();
      }

      const processedPropertyDocumentsDtos = propertyDocumentDetails.map(
        (dto, index) => ({
          ...dto,
          documentFile: files[index],
        }),
      );

      const result =
        await this.propertyDocumentsService.createPropertyDocuments(
          processedPropertyDocumentsDtos,
        );
      return result;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpException(
          `Invalid request body format. Please provide a valid JSON string for propertyDocuments.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'An error occurred while creating the property documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllPropertyDocuments(): Promise<{
    success: boolean;
    message: string;
    data?: PropertyDocuments[];
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertyDocumentsService.findAllPropertyDocuments();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all property documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('propertyDocument/:id')
  async getByPropertyDocumentId(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertyDocuments;
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertyDocumentsService.findPropertyDocumentById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the property document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('propertyDocument/:id')
  @UseInterceptors(FileInterceptor('documentFile'))
  async updatePropertyDocumentId(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updatePropertyDocumentRequestDto: UpdatePropertyDocumentRequestDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyDocuments;
    statusCode: HttpStatus;
  }> {
    try {
      const updatePropertyDocumentDto: UpdatePropertyDocumentDto = JSON.parse(
        updatePropertyDocumentRequestDto.propertyDocument,
      );

      if (
        (file && !updatePropertyDocumentDto) ||
        (!file && updatePropertyDocumentDto)
      ) {
        return PROPERTY_DOCUMENTS_RESPONSES.MISMATCHED_DTO_AND_DOCUMENTS();
      }

      const max_file_size = getMaxFileSize();
      const allowedExtensions = getAllowedDocumentExtensions();

      if (file) {
        if (!isFileSizeValid(file, max_file_size)) {
          return PROPERTY_DOCUMENTS_RESPONSES.FILE_SIZE_TOO_LARGE(
            max_file_size,
          );
        }

        if (!isFileExtensionValid(file, allowedExtensions)) {
          return PROPERTY_DOCUMENTS_RESPONSES.UNSUPPORTED_FILE_EXTENSION(
            allowedExtensions,
          );
        }
      }

      updatePropertyDocumentDto.documentFile = file;
      const result =
        await this.propertyDocumentsService.updatePropertyDocumentDetail(
          id,
          updatePropertyDocumentDto,
        );
      return result;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpException(
          `Invalid request body format. Please provide a valid JSON string for propertyDocument.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'An error occurred while updating the property document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('propertyDocument/:id')
  async deletePropertyDocument(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result =
        await this.propertyDocumentsService.deletePropertyDocumentById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the property document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
