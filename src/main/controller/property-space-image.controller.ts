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
import { PropertySpaceImage } from '../entities/property-space-image.entity';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { getMaxFileCount } from '../utils/image-file.utils';
import { CreatePropertySpaceImageRequestDto } from '../dto/requests/property-space-image/create-request.dto';
import { CreatePropertySpaceImageDto } from '../dto/requests/property-space-image/create.dto';
import { UpdatePropertySpaceImageRequestDto } from '../dto/requests/property-space-image/update-request.dto';
import { UpdatePropertySpaceImageDto } from '../dto/requests/property-space-image/update.dto';
import { PROPERTY_SPACE_IMAGE_RESPONSES } from '../commons/constants/response-constants/property-space-image.constant';
import { PropertySpaceImageService } from '../service/property-space-image.service';
import { DeletePropertySpaceImagesDto } from '../dto/requests/property-space-image/delete-by-ids-request.dto';
import {
  validateFile,
  validateFiles,
} from '../utils/fileUploadValidation.Util';
import { PropertyAdditionalImage } from '../entities/property-additional-image.entity';

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
    data?: PropertySpaceImage[];
    statusCode: HttpStatus;
  }> {
    try {
      const validationResponse = await validateFiles(files.imageFiles || []);
      if (validationResponse) {
        return validationResponse;
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
    data?: PropertySpaceImage[];
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
    data?: PropertySpaceImage;
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
    data?: PropertySpaceImage;
    statusCode: HttpStatus;
  }> {
    try {
      const updatePropertySpaceImageDto: UpdatePropertySpaceImageDto =
        JSON.parse(updatePropertySpaceImageRequestDto.propertySpaceImage);

      const file = files.imageFile ? files.imageFile[0] : undefined;
      if (file) {
        const validationResponse = await validateFile(file);
        if (validationResponse) {
          return validationResponse;
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

  @Get('property/:propertyId/images')
  async getPropertySpaceImagesByPropertyId(
    @Param('propertyId') propertyId: number,
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      propertySpaceImages: PropertySpaceImage[];
      propertyAdditionalImages: PropertyAdditionalImage[];
    };
    statusCode: number;
  }> {
    try {
      const result =
        await this.propertySpaceImageService.findPropertySpaceImagesByPropertyId(
          propertyId,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving property space images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('property-space/:propertySpaceId/images')
  async getPropertySpaceImagesByPropertySpaceId(
    @Param('propertySpaceId') propertySpaceId: number,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceImage[];
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertySpaceImageService.findPropertySpaceImagesByPropertySpaceId(
          propertySpaceId,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving property space images',
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

  @Delete()
  async deletePropertySpaceImages(
    @Body() deletePropertySpaceImagesDto: DeletePropertySpaceImagesDto,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const { ids } = deletePropertySpaceImagesDto;
      const result =
        await this.propertySpaceImageService.deletePropertySpaceImagesByIds(
          ids,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the property space images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
