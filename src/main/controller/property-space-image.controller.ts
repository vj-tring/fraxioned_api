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
import { PropertySapceImage } from '../entities/property-space-image.entity';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import {
  getMaxFileSize,
  getAllowedExtensions,
  getMaxFileCount,
  isFileSizeValid,
  isFileExtensionValid,
} from '../utils/image-file.utils';
import { CreatePropertySpaceImageRequestDto } from '../dto/requests/property-space-image/create-request.dto';
import { CreatePropertySpaceImageDto } from '../dto/requests/property-space-image/create.dto';
import { UpdatePropertySpaceImageRequestDto } from '../dto/requests/property-space-image/update-request.dto';
import { UpdatePropertySpaceImageDto } from '../dto/requests/property-space-image/update.dto';
import { PROPERTY_SPACE_IMAGE_RESPONSES } from '../commons/constants/response-constants/property-space-image.constant';
import { PropertySpaceImageService } from '../service/property-space-image.service';

@ApiTags('Property Space Images')
@Controller('v1/property-space-images')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertySpaceImageController {
  constructor(
    private readonly propertySpaceImageService: PropertySpaceImageService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageFiles', maxCount: getMaxFileCount() },
    ]),
  )
  async createPropertySpaceImages(
    @UploadedFiles() files: { imageFiles?: Express.Multer.File[] },
    @Body()
    createPropertySpaceImageRequestDto: CreatePropertySpaceImageRequestDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySapceImage[];
    statusCode: HttpStatus;
  }> {
    try {
      const max_file_size = getMaxFileSize();
      const allowedExtensions = getAllowedExtensions();

      const hasOversizedFile = (files.imageFiles || []).some(
        (file) => !isFileSizeValid(file, max_file_size),
      );

      if (hasOversizedFile) {
        return PROPERTY_SPACE_IMAGE_RESPONSES.FILE_SIZE_TOO_LARGE(
          max_file_size,
        );
      }

      const hasUnsupportedExtension = (files.imageFiles || []).some(
        (file) => !isFileExtensionValid(file, allowedExtensions),
      );

      if (hasUnsupportedExtension) {
        return PROPERTY_SPACE_IMAGE_RESPONSES.UNSUPPORTED_FILE_EXTENSION(
          allowedExtensions,
        );
      }

      const propertySpaceImageDetails: CreatePropertySpaceImageDto[] =
        JSON.parse(createPropertySpaceImageRequestDto.propertySpaceImages);

      if (
        propertySpaceImageDetails.length !== (files.imageFiles?.length || 0)
      ) {
        return PROPERTY_SPACE_IMAGE_RESPONSES.MISMATCHED_DTO_AND_IMAGES();
      }

      const processedPropertySpaceImagesDtos = propertySpaceImageDetails.map(
        (dto, index) => ({
          ...dto,
          imageFile: files.imageFiles[index],
        }),
      );

      const result =
        await this.propertySpaceImageService.createPropertySpaceImages(
          processedPropertySpaceImagesDtos,
        );
      return result;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpException(
          `Invalid request body format. Please provide a valid JSON string for propertySpaceImages.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'An error occurred while creating the property space images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllPropertySpaceImages(): Promise<{
    success: boolean;
    message: string;
    data?: PropertySapceImage[];
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertySpaceImageService.findAllPropertySpaceImages();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all property space images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('property-space-image/:id')
  async getPropertySpaceImageById(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertySapceImage;
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertySpaceImageService.findPropertySpaceImageById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the property space image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('property-space-image/:id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'imageFile', maxCount: 1 }]))
  async updatePropertySpaceImage(
    @Param('id') id: number,
    @UploadedFiles() files: { imageFile?: Express.Multer.File[] },
    @Body()
    updatePropertySpaceImageRequestDto: UpdatePropertySpaceImageRequestDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySapceImage;
    statusCode: HttpStatus;
  }> {
    try {
      const updatePropertySpaceImageDto: UpdatePropertySpaceImageDto =
        JSON.parse(updatePropertySpaceImageRequestDto.propertySpaceImage);

      const file = files.imageFile ? files.imageFile[0] : undefined;

      if (
        (file && !updatePropertySpaceImageDto) ||
        (!file && updatePropertySpaceImageDto)
      ) {
        return PROPERTY_SPACE_IMAGE_RESPONSES.MISMATCHED_DTO_AND_IMAGES();
      }

      const max_file_size = getMaxFileSize();
      const allowedExtensions = getAllowedExtensions();

      if (file) {
        if (!isFileSizeValid(file, max_file_size)) {
          return PROPERTY_SPACE_IMAGE_RESPONSES.FILE_SIZE_TOO_LARGE(
            max_file_size,
          );
        }

        if (!isFileExtensionValid(file, allowedExtensions)) {
          return PROPERTY_SPACE_IMAGE_RESPONSES.UNSUPPORTED_FILE_EXTENSION(
            allowedExtensions,
          );
        }
      }

      updatePropertySpaceImageDto.imageFile = file;
      const result =
        await this.propertySpaceImageService.updatePropertySpaceImage(
          id,
          updatePropertySpaceImageDto,
        );
      return result;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpException(
          `Invalid request body format. Please provide a valid JSON string for propertySpaceImage.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'An error occurred while updating the property space image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('property-space-image/:id')
  async deletePropertySpaceImage(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result =
        await this.propertySpaceImageService.deletePropertySpaceImageById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the property space image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
