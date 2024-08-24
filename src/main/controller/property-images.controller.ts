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
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreatePropertyImagesRequestDto } from '../dto/requests/create-property-images-request.dto';
import { CreatePropertyImagesDto } from '../dto/requests/create-property-images.dto';
import { ApiTags } from '@nestjs/swagger';
import { PropertyImagesService } from '../service/property-images.service';
import { PropertyImages } from '../entities/property_images.entity';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { PROPERTY_IMAGES_RESPONSES } from '../commons/constants/response-constants/property-images.constant';

@ApiTags('Property Images')
@Controller('v1/propertyImages')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertyImagesController {
  constructor(private readonly propertyImagesService: PropertyImagesService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'imageFiles', maxCount: 50 }]),
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
