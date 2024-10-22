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
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { getMaxFileCount } from '../utils/image-file.utils';
import { PROPERTY_SPACE_IMAGE_RESPONSES } from '../commons/constants/response-constants/property-space-image.constant';
import {
  validateFile,
  validateFiles,
} from '../utils/fileUploadValidation.Util';
import { PropertyAdditionalImageService } from '../service/property-additional-image.service';
import { CreatePropertyAdditionalImageRequestDto } from '../dto/requests/property-additional-image/create-property-additional-image-request.dto';
import { PropertyAdditionalImage } from '../entities/property-additional-image.entity';
import { CreatePropertyAdditionalImageDto } from '../dto/requests/property-additional-image/create-property-additional-image.dto';
import { ApiResponse } from '../commons/response-body/common.responses';
import { UpdatePropertyAdditionalImageDto } from '../dto/requests/property-additional-image/update-property-additional-image.dto';
import { DeletePropertyAdditionalImagesDto } from '../dto/requests/property-additional-image/delete-property-additional-images.dto';

@ApiTags('PropertyAdditionalImages')
@Controller('v1/property-additional-images')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertyAdditionalImageController {
  constructor(
    private readonly propertyAdditionalImageService: PropertyAdditionalImageService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageFiles', maxCount: getMaxFileCount() },
    ]),
  )
  async createPropertyAdditionalImages(
    @UploadedFiles() files: { imageFiles?: Express.Multer.File[] },
    @Body()
    createPropertyAdditionalImageRequestDto: CreatePropertyAdditionalImageRequestDto,
  ): Promise<ApiResponse<PropertyAdditionalImage[]>> {
    try {
      const validationResponse = await validateFiles(files.imageFiles || []);
      if (validationResponse) {
        return validationResponse;
      }

      const propertyAdditionalImageDetails: CreatePropertyAdditionalImageDto[] =
        JSON.parse(
          createPropertyAdditionalImageRequestDto.propertyAdditionalImages,
        );

      if (
        propertyAdditionalImageDetails.length !==
        (files.imageFiles?.length || 0)
      ) {
        return PROPERTY_SPACE_IMAGE_RESPONSES.MISMATCHED_DTO_AND_IMAGES();
      }

      const processedPropertyAdditionalImagesDtos =
        propertyAdditionalImageDetails.map((dto, index) => ({
          ...dto,
          imageFile: files.imageFiles[index],
        }));

      const result =
        await this.propertyAdditionalImageService.createPropertyAdditionalImages(
          processedPropertyAdditionalImagesDtos,
        );
      return result;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpException(
          `Invalid request body format. Please provide a valid JSON string for propertyAdditionalImages.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'An error occurred while creating the property additional images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('property-additional-image/:id')
  async getPropertyAdditionalImageById(
    @Param('id') id: number,
  ): Promise<ApiResponse<PropertyAdditionalImage>> {
    try {
      const result =
        await this.propertyAdditionalImageService.findPropertyAdditionalImageDetailById(
          id,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the property additional image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('property/:propertyId')
  async getPropertyAdditionalImagesByPropertyId(
    @Param('propertyId') propertyId: number,
  ): Promise<ApiResponse<PropertyAdditionalImage[]>> {
    try {
      const result =
        await this.propertyAdditionalImageService.findPropertyAdditionalImagesByPropertyId(
          propertyId,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving property additional images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('property-additional-image/:id')
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update already existing property additional image',
    type: UpdatePropertyAdditionalImageDto,
  })
  async updatePropertyAdditionalImage(
    @Param('id') id: string,
    @Body() updatePropertyAdditionalImageDto: UpdatePropertyAdditionalImageDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ): Promise<ApiResponse<PropertyAdditionalImage>> {
    try {
      if (imageFile) {
        const validationResponse = await validateFile(imageFile);
        if (validationResponse) {
          return validationResponse;
        }
      }
      const result =
        await this.propertyAdditionalImageService.updatePropertyAdditionalImageById(
          +id,
          updatePropertyAdditionalImageDto,
          imageFile,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the property additional image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('property-additional-image/:id')
  async deletePropertyAdditionalImage(
    @Param('id') id: number,
  ): Promise<ApiResponse<PropertyAdditionalImage>> {
    try {
      const result =
        await this.propertyAdditionalImageService.deletePropertyAdditionalImageById(
          id,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the property additional image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  async deletePropertyAdditionalImages(
    @Body()
    deletePropertyAdditionalImagesDto: DeletePropertyAdditionalImagesDto,
  ): Promise<ApiResponse<PropertyAdditionalImage>> {
    try {
      const { ids } = deletePropertyAdditionalImagesDto;
      const result =
        await this.propertyAdditionalImageService.deletePropertyAdditionalImagesByIds(
          ids,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the property additional images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
