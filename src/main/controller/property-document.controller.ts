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
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { PropertyDocuments } from '../entities/property-document.entity';
import { PropertyDocumentsService } from '../service/property-document.service';
import { PROPERTY_DOCUMENTS_RESPONSES } from '../commons/constants/response-constants/property-document.constant';
import {
  getMaxFileSize,
  getAllowedDocumentExtensions,
  getMaxFileCount,
  isFileSizeValid,
  isFileExtensionValid,
} from '../utils/image-file.utils';
import { validateFile } from '../utils/fileUploadValidation.Util';
import { DeletePropertyDocumentsDto } from '../dto/requests/property-document/delete-by-ids-request.dto';
import { CreatePropertyDocumentsRequestDto } from '../dto/requests/property-document/create-request.dto';
import { UpdatePropertyDocumentRequestDto } from '../dto/requests/property-document/update-request.dto';

@ApiTags('Property Documents')
@Controller('v1/property-documents')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertyDocumentsController {
  constructor(
    private readonly propertyDocumentsService: PropertyDocumentsService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'documentFiles', maxCount: getMaxFileCount() },
    ]),
  )
  async createPropertyDocuments(
    @UploadedFiles() files: { documentFiles?: Express.Multer.File[] },
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

      const hasOversizedFile = (files.documentFiles || []).some(
        (file) => !isFileSizeValid(file, max_file_size),
      );

      if (hasOversizedFile) {
        return PROPERTY_DOCUMENTS_RESPONSES.FILE_SIZE_TOO_LARGE(max_file_size);
      }

      const hasUnsupportedExtension = (files.documentFiles || []).some(
        (file) => !isFileExtensionValid(file, allowedExtensions),
      );

      if (hasUnsupportedExtension) {
        return PROPERTY_DOCUMENTS_RESPONSES.UNSUPPORTED_FILE_EXTENSION(
          allowedExtensions,
        );
      }

      const propertyDocumentDetails = JSON.parse(
        createPropertyDocumentsRequestDto.propertyDocuments,
      );

      if (
        propertyDocumentDetails.length !== (files.documentFiles?.length || 0)
      ) {
        return PROPERTY_DOCUMENTS_RESPONSES.MISMATCHED_DTO_AND_DOCUMENTS();
      }

      const processedPropertyDocumentsDtos = propertyDocumentDetails.map(
        (dto, index) => ({
          ...dto,
          documentFile: files.documentFiles[index],
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

  @Get('property/:id')
  async getByPropertyId(@Param('id') propertyId: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertyDocuments[];
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertyDocumentsService.findPropertyDocumentsByPropertyId(
          propertyId,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the property documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('property-document/:id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'documentFile', maxCount: 1 }]),
  )
  async updatePropertyDocumentId(
    @Param('id') id: number,
    @UploadedFiles() files: { documentFile?: Express.Multer.File[] },
    @Body() updatePropertyDocumentRequestDto: UpdatePropertyDocumentRequestDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyDocuments;
    statusCode: HttpStatus;
  }> {
    try {
      const updatePropertyDocumentDto = JSON.parse(
        updatePropertyDocumentRequestDto.propertyDocument,
      );

      const file = files.documentFile ? files.documentFile[0] : undefined;
      if (file) {
        const validationResponse = await validateFile(file);
        if (validationResponse) {
          return validationResponse;
        }
      }

      updatePropertyDocumentDto.documentFile = file;
      const result = await this.propertyDocumentsService.updatePropertyDocument(
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

  @Delete('property-document/:id')
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

  @Delete('property-documents')
  async deletePropertyDocuments(
    @Body() deletePropertyDocumentsDto: DeletePropertyDocumentsDto,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const { ids } = deletePropertyDocumentsDto;
      const result =
        await this.propertyDocumentsService.deletePropertyDocumentsByIds(ids);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the property documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
