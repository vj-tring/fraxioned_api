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
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { PropertySpaceAmenitiesService } from '../service/property-space-amenity.service';
import { CreateOrDeletePropertySpaceAmenitiesDto } from '../dto/requests/property-space-amenity/create-or-delete-property-amenities.dto';
import { CreatePropertySpaceAmenitiesDto } from '../dto/requests/property-space-amenity/create-property-space-amenities.dto';
import { UpdatePropertySpaceAmenitiesDto } from '../dto/requests/property-space-amenity/update-property-space-amenities.dto';
import { PropertySpaceAmenities } from '../entities/property-space-amenity.entity';

@ApiTags('PropertySpaceAmenities')
@Controller('v1/property-amenities')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertySpaceAmenitiesController {
  constructor(
    private readonly propertyAmenitiesService: PropertySpaceAmenitiesService,
  ) {}

  @Post('property-amenity')
  async createPropertyAmenity(
    @Body() createPropertyAmenityDto: CreatePropertySpaceAmenitiesDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities;
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
    data?: PropertySpaceAmenities[];
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
    data?: PropertySpaceAmenities;
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
    data?: PropertySpaceAmenities[];
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
    @Body() updatePropertyAmenitiesDto: UpdatePropertySpaceAmenitiesDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.propertyAmenitiesService.updatePropertyAmenity(
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

  @Patch()
  async createOrDeletePropertyAmenities(
    @Body()
    createOrDeletePropertyAmenitiesDto: CreateOrDeletePropertySpaceAmenitiesDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities[];
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertyAmenitiesService.createOrDeletePropertySpaceAmenities(
          createOrDeletePropertyAmenitiesDto,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creation or deletion of property amenities for the selected property',
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
