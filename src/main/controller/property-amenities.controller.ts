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
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { PropertyAmenitiesService } from '../service/property-amenities.service';
import { CreatePropertyAmenitiesDto } from '../dto/requests/create-property-amenities.dto';
import { PropertyAmenities } from '../entities/property_amenities.entity';
import { UpdatePropertyAmenitiesDto } from '../dto/requests/update-property-amenities.dto';
import { AuthGuard } from '../commons/guards/auth.guard';

@ApiTags('Property Amenities')
@Controller('v1/property-amenities/property-amenity')
export class PropertyAmenitiesController {
  constructor(
    private readonly propertyAmenitiesService: PropertyAmenitiesService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
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
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
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

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
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

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
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

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
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
