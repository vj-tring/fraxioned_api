import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Property } from '../owner-property/entity/property.entity';
import { PropertyPhoto } from '../owner-property/entity/property-photo.entity';
import { PropertyService } from './property.service';

@ApiTags('Property')
@Controller('api/property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get(':propertyId')
  async getPropertyDetails(@Param('propertyId') id: number): Promise<Property> {
    return this.propertyService.getPropertyDetailsById(id);
  }

  @Get('/photos/:propertyId')
  async getPropertyPhotos(
    @Param('propertyId') id: number,
  ): Promise<PropertyPhoto[]> {
    return this.propertyService.getPropertyPhotosByPropertyId(id);
  }
}
