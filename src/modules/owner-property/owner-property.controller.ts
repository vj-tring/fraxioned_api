import { Controller, Get, Param } from '@nestjs/common';
import { OwnerPropertyService } from './owner-property.service';
import { Property } from './entity/property.entity';
import { OffSeasonDto } from './dto/off-season.dto';
import { PeakSeasonRentingDto } from './dto/peak-season-renting.dto';
import { ApiTags } from '@nestjs/swagger';
import { PeakSeasonDto } from './dto/peak-season.dto';

@ApiTags('Owner-Property')
@Controller('api/property')
export class OwnerPropertyController {
  constructor(private readonly propertyService: OwnerPropertyService) {}

  @Get('/owner-property/:ownerId')
  async getOwnerProperties(
    @Param('ownerId') owner_id: number,
  ): Promise<Property[]> {
    return this.propertyService.getOwnerProperties(owner_id);
  }

  @Get('/owner-property-details/off-season/:ownerId')
  async getOwnerPropertyOffSeasonDetails(
    @Param('ownerId') owner_id: number,
  ): Promise<OffSeasonDto[]> {
    return this.propertyService.getOwnerPropertyOffSeasonDetails(owner_id);
  }

  @Get('/owner-property-details/peak-season-renting/:ownerId')
  async getOwnerPropertyPeakSeasonDetails(
    @Param('ownerId') owner_id: number,
  ): Promise<PeakSeasonRentingDto[]> {
    return this.propertyService.getOwnerPropertyPeakSeasonDetails(owner_id);
  }

  @Get('/owner-property-details/peak-season/:ownerId')
  async getPeakSeasonDetails(
    @Param('ownerId') owner_id: number,
  ): Promise<PeakSeasonDto[]> {
    return this.propertyService.getPeakSeasonDetails(owner_id);
  }
}
