import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { AmenitiesService } from '../service/amenities.service';
import { CreateAmenitiesDto } from '../dto/requests/amenity/create-amenities.dto';
import { Amenities } from '../entities/amenities.entity';
import { UpdateAmenitiesDto } from '../dto/requests/amenity/update-amenities.dto';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { validateFile } from '../utils/fileUploadValidation.Util';

@ApiTags('Amenities')
@Controller('v1/amenities')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Post('amenity')
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new amenity',
    type: CreateAmenitiesDto,
  })
  async createAmenity(
    @Body() createAmenitiesDto: CreateAmenitiesDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ): Promise<{
    success: boolean;
    message: string;
    data?: Amenities;
    statusCode: HttpStatus;
  }> {
    try {
      if (imageFile) {
        const validationResponse = await validateFile(imageFile);
        if (validationResponse) {
          return validationResponse;
        }
      }
      const result = await this.amenitiesService.createAmenity(
        createAmenitiesDto,
        imageFile,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllAmenities(): Promise<{
    success: boolean;
    message: string;
    data?: Amenities[];
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.amenitiesService.findAllAmenities();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all amenities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('amenity/:id')
  async getAmenityById(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: Amenities;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.amenitiesService.findAmenityById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('amenity/:id')
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update already existing space',
    type: UpdateAmenitiesDto,
  })
  async updateAmenityDetail(
    @Param('id') id: string,
    @Body() updateAmenitiesDto: UpdateAmenitiesDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ): Promise<{
    success: boolean;
    message: string;
    data?: Amenities;
    statusCode: HttpStatus;
  }> {
    try {
      if (imageFile) {
        const validationResponse = await validateFile(imageFile);
        if (validationResponse) {
          return validationResponse;
        }
      }
      const result = await this.amenitiesService.updateAmenityDetailById(
        +id,
        updateAmenitiesDto,
        imageFile,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('amenity/:id')
  async deleteAmenity(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result = await this.amenitiesService.deleteAmenityById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
