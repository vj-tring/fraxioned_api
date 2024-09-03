import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PropertyAmenitiesService } from '../service/property-amenities.service';
import { CreatePropertyAmenitiesDto } from '../dto/requests/property-amenity/create-property-amenities.dto';
import { PropertyAmenities } from '../entities/property_amenities.entity';
import { UpdatePropertyAmenitiesDto } from '../dto/requests/property-amenity/update-property-amenities.dto';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';

@ApiTags('Property Amenities')
@Controller('v1/property-amenities')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertyAmenitiesController {
  constructor(
    private readonly propertyAmenitiesService: PropertyAmenitiesService,
  ) {}

  @Post('property-amenity')
  async createPropertyAmenity(
    @Body() createPropertyAmenityDto: CreatePropertyAmenitiesDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyAmenities;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.propertyAmenitiesService.createPropertyAmenity(
        createPropertyAmenityDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the property amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllPropertyAmenities(): Promise<{
    success: boolean;
    message: string;
    data?: PropertyAmenities[];
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertyAmenitiesService.findAllPropertySAmenities();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all property amenities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('property-amenity/:id')
  async getPropertyAmenityById(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertyAmenities;
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertyAmenitiesService.findPropertyAmenityById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the property amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('property/:id')
  async getHolidaysByPropertyId(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertyAmenities[];
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertyAmenitiesService.findAmenitiesByPropertyId(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the amenities list for the selected property',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('property-amenity/:id')
  async updatePropertyAmenityDetail(
    @Param('id') id: string,
    @Body() updatePropertyAmenitiesDto: UpdatePropertyAmenitiesDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyAmenities;
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertyAmenitiesService.updatePropertyAmenityHoliday(
          +id,
          updatePropertyAmenitiesDto,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the property amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('property-amenity/:id')
  async deletePropertyAmenity(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result =
        await this.propertyAmenitiesService.removePropertyAmenity(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the property amenity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
