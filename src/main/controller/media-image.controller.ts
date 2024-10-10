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
import { CreateMediaImageRequestDto } from '../dto/requests/media-image/create-request.dto';
import { CreateMediaImageDto } from '../dto/requests/media-image/create.dto';
import { ApiTags } from '@nestjs/swagger';
import { MediaImageService } from '../service/media-image.service';
import { MediaImage } from '../entities/media-image.entity';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { MEDIA_IMAGE_RESPONSES } from '../commons/constants/response-constants/media-image.constant';
import { UpdateMediaImageDto } from '../dto/requests/media-image/update.dto';
import { UpdateMediaImageRequestDto } from '../dto/requests/media-image/update-request.dto';
import {
  getMaxFileSize,
  getAllowedExtensions,
  getMaxFileCount,
  isFileSizeValid,
  isFileExtensionValid,
} from '../utils/image-file.utils';

@ApiTags('Media Images')
@Controller('v1/media-images')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class MediaImageController {
  constructor(private readonly mediaImageService: MediaImageService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageFiles', maxCount: getMaxFileCount() },
    ]),
  )
  async createMediaImages(
    @UploadedFiles() files: { imageFiles?: Express.Multer.File[] },
    @Body() createMediaImageRequestDto: CreateMediaImageRequestDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: MediaImage[];
    statusCode: HttpStatus;
  }> {
    try {
      const max_file_size = getMaxFileSize();
      const allowedExtensions = getAllowedExtensions();

      const hasOversizedFile = (files.imageFiles || []).some(
        (file) => !isFileSizeValid(file, max_file_size),
      );

      if (hasOversizedFile) {
        return MEDIA_IMAGE_RESPONSES.FILE_SIZE_TOO_LARGE(max_file_size);
      }

      const hasUnsupportedExtension = (files.imageFiles || []).some(
        (file) => !isFileExtensionValid(file, allowedExtensions),
      );

      if (hasUnsupportedExtension) {
        return MEDIA_IMAGE_RESPONSES.UNSUPPORTED_FILE_EXTENSION(
          allowedExtensions,
        );
      }

      const mediaImageDetails: CreateMediaImageDto[] = JSON.parse(
        createMediaImageRequestDto.mediaImages,
      );

      if (mediaImageDetails.length !== (files.imageFiles?.length || 0)) {
        return MEDIA_IMAGE_RESPONSES.MISMATCHED_DTO_AND_IMAGES();
      }

      const processedMediaImagesDtos = mediaImageDetails.map((dto, index) => ({
        ...dto,
        imageFile: files.imageFiles[index],
      }));

      const result = await this.mediaImageService.createMediaImages(
        processedMediaImagesDtos,
      );
      return result;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpException(
          `Invalid request body format. Please provide a valid JSON string for mediaImages.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'An error occurred while creating the media images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllMediaImages(): Promise<{
    success: boolean;
    message: string;
    data?: MediaImage[];
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.mediaImageService.findAllMediaImages();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all media images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('media-image/:id')
  async getByMediaImageId(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: MediaImage;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.mediaImageService.findMediaImageById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the media image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('media-image/:id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'imageFile', maxCount: 1 }]))
  async updateMediaImageId(
    @Param('id') id: number,
    @UploadedFiles() files: { imageFile?: Express.Multer.File[] },
    @Body() updateMediaImageRequestDto: UpdateMediaImageRequestDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: MediaImage;
    statusCode: HttpStatus;
  }> {
    try {
      const updateMediaImageDto: UpdateMediaImageDto = JSON.parse(
        updateMediaImageRequestDto.mediaImage,
      );

      const file = files.imageFile ? files.imageFile[0] : undefined;

      if ((file && !updateMediaImageDto) || (!file && updateMediaImageDto)) {
        return MEDIA_IMAGE_RESPONSES.MISMATCHED_DTO_AND_IMAGES();
      }

      const max_file_size = getMaxFileSize();
      const allowedExtensions = getAllowedExtensions();

      if (file) {
        if (!isFileSizeValid(file, max_file_size)) {
          return MEDIA_IMAGE_RESPONSES.FILE_SIZE_TOO_LARGE(max_file_size);
        }

        if (!isFileExtensionValid(file, allowedExtensions)) {
          return MEDIA_IMAGE_RESPONSES.UNSUPPORTED_FILE_EXTENSION(
            allowedExtensions,
          );
        }
      }

      updateMediaImageDto.imageFile = file;
      const result = await this.mediaImageService.updateMediaImage(
        id,
        updateMediaImageDto,
      );
      return result;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpException(
          `Invalid request body format. Please provide a valid JSON string for mediaImage.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'An error occurred while updating the media image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('media-image/:id')
  async deleteMediaImage(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result = await this.mediaImageService.deleteMediaImageById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the media image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
