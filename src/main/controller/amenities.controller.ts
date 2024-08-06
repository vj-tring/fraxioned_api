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
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { AmenitiesService } from '../service/amenities.service';
import { CreateAmenitiesDto } from '../dto/requests/create-amenities.dto';
import { Amenities } from '../entities/amenities.entity';
import { UpdateAmenitiesDto } from '../dto/requests/update-amenities.dto';

@ApiTags('Amenities')
@Controller('v1/amenities/amenity')
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
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
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
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
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
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
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
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
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
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
