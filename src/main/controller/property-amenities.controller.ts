import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PropertyAmenitiesService } from '../service/property-amenities.service';

@ApiTags('Property Amenities')
@Controller('v1/property-amenities/property-amenity')
export class PropertyAmenitiesController {
  constructor(
    private readonly propertyAmenitiesService: PropertyAmenitiesService,
  ) {}
}
