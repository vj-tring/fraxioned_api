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
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { CreatePropertyImagesRequestDto } from '../dto/requests/property-images/create-property-images-request.dto';
import { CreatePropertyImagesDto } from '../dto/requests/property-images/create-property-images.dto';
import { ApiTags } from '@nestjs/swagger';
import { PropertyImagesService } from '../service/property-images.service';
import { PropertyImages } from '../entities/property_images.entity';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { PROPERTY_IMAGES_RESPONSES } from '../commons/constants/response-constants/property-images.constant';
import { UpdatePropertyImageDto } from '../dto/requests/property-images/update-property-image.dto';
import { UpdatePropertyImageRequestDto } from '../dto/requests/property-images/update-property-image-request.dto';
import {
  getMaxFileSize,
  getAllowedExtensions,
  getMaxFileCount,
  isFileSizeValid,
  isFileExtensionValid,
} from '../utils/image-file.utils';

@ApiTags('Property Images')
@Controller('v1/propertyImages')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertyImagesController {
  constructor(private readonly propertyImagesService: PropertyImagesService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageFiles', maxCount: getMaxFileCount() },
    ]),
  )
  async createPropertyImages(
    @UploadedFiles() files: { imageFiles?: Express.Multer.File[] },
    @Body() createPropertyImagesRequestDto: CreatePropertyImagesRequestDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyImages[];
    statusCode: HttpStatus;
  }> {
    try {
      const max_file_size = getMaxFileSize();
      const allowedExtensions = getAllowedExtensions();

      const hasOversizedFile = (files.imageFiles || []).some(
        (file) => !isFileSizeValid(file, max_file_size),
      );

      if (hasOversizedFile) {
        return PROPERTY_IMAGES_RESPONSES.FILE_SIZE_TOO_LARGE(max_file_size);
      }

      const hasUnsupportedExtension = (files.imageFiles || []).some(
        (file) => !isFileExtensionValid(file, allowedExtensions),
      );

      if (hasUnsupportedExtension) {
        return PROPERTY_IMAGES_RESPONSES.UNSUPPORTED_FILE_EXTENSION(
          allowedExtensions,
        );
      }

      const propertyImageDetails: CreatePropertyImagesDto[] = JSON.parse(
        createPropertyImagesRequestDto.propertyImages,
      );

      if (propertyImageDetails.length !== (files.imageFiles?.length || 0)) {
        return PROPERTY_IMAGES_RESPONSES.MISMATCHED_DTO_AND_IMAGES();
      }

      const processedPropertyImagesDtos = propertyImageDetails.map(
        (dto, index) => ({
          ...dto,
          imageFiles: files.imageFiles ? files.imageFiles[index] : null,
        }),
      );

      const result = await this.propertyImagesService.createPropertyImages(
        processedPropertyImagesDtos,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the property images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllPropertyImages(): Promise<{
    success: boolean;
    message: string;
    data?: PropertyImages[];
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.propertyImagesService.findAllPropertyImages();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all property images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('propertyImage/:id')
  async getByPropertyImageId(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertyImages;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.propertyImagesService.findPropertyImageById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the property image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('propertyImage/:id')
  @UseInterceptors(FileInterceptor('imageFile'))
  async updatePropertyImageId(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updatePropertyImageRequestDto: UpdatePropertyImageRequestDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyImages;
    statusCode: HttpStatus;
  }> {
    try {
      const updatePropertyImageDto: UpdatePropertyImageDto = JSON.parse(
        updatePropertyImageRequestDto.propertyImage,
      );

      if (
        (file && !updatePropertyImageDto) ||
        (!file && updatePropertyImageDto)
      ) {
        return PROPERTY_IMAGES_RESPONSES.MISMATCHED_DTO_AND_IMAGES();
      }

      const max_file_size = getMaxFileSize();
      const allowedExtensions = getAllowedExtensions();

      if (file) {
        if (!isFileSizeValid(file, max_file_size)) {
          return PROPERTY_IMAGES_RESPONSES.FILE_SIZE_TOO_LARGE(max_file_size);
        }

        if (!isFileExtensionValid(file, allowedExtensions)) {
          return PROPERTY_IMAGES_RESPONSES.UNSUPPORTED_FILE_EXTENSION(
            allowedExtensions,
          );
        }
      }

      updatePropertyImageDto.imageFile = file;
      const result = await this.propertyImagesService.updatePropertyImageDetail(
        +id,
        updatePropertyImageDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the property image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('propertyImage/:id')
  async deletePropertyImage(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result =
        await this.propertyImagesService.deletePropertyImageById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the property image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
