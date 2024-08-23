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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { AmenitiesService } from '../service/amenities.service';
import { CreateAmenitiesDto } from '../dto/requests/amenity/create-amenities.dto';
import { Amenities } from '../entities/amenities.entity';
import { UpdateAmenitiesDto } from '../dto/requests/amenity/update-amenities.dto';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';

@ApiTags('Amenities')
@Controller('v1/amenities/amenity')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Post()
  async createAmenity(@Body() createAmenitiesDto: CreateAmenitiesDto): Promise<{
    success: boolean;
    message: string;
    data?: Amenities;
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.amenitiesService.createAmenity(createAmenitiesDto);
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

  @Get(':id')
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

  @Patch(':id')
  async updateAmenityDetail(
    @Param('id') id: string,
    @Body() updateAmenitiesDto: UpdateAmenitiesDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: Amenities;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.amenitiesService.updateAmenityDetailById(
        +id,
        updateAmenitiesDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
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
