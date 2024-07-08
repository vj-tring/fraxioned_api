import { Controller, Get, Param } from '@nestjs/common';
import { PropertyService } from './owner-property.service';
import { Property } from './entity/property.entity';
import { PropertyPhoto } from './entity/property-photo.entity';
import { OffSeasonDto } from './dto/off-season.dto';
import { PeakSeasonDto } from './dto/peak-season.dto';

@Controller('api/property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get(':id')
  async getPropertyDetails(@Param('id') id: number): Promise<Property> {
    return this.propertyService.getPropertyDetailsById(id);
  }

  @Get('/photos/:id')
  async getPropertyPhotos(@Param('id') id: number): Promise<PropertyPhoto[]> {
    return this.propertyService.getPropertyPhotosByPropertyId(id);
  }

  @Get('/owner-property/:user_id')
  async getOwnerProperties(
    @Param('user_id') user_id: number,
  ): Promise<Property[]> {
    return this.propertyService.getOwnerProperties(user_id);
  }
  @Get('/owner-property-details/off-season/:userId')
  async getOwnerPropertyDetailsByUserId(
    @Param('userId') userId: number,
  ): Promise<OffSeasonDto[]> {
    return this.propertyService.getOwnerPropertyDetailsByUserId(userId);
  }

  @Get('/owner-property-details/peak-season/:userId')
  async getOwnerPropertyDetailsPeakSeason(
    @Param('userId') userId: number,
  ): Promise<PeakSeasonDto[]> {
    return this.propertyService.getOwnerPropertyDetailsPeakSeason(userId);
  }
}
