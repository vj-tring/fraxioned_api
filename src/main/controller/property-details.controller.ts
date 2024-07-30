import { ValidationPipe, Body, Post, UsePipes, Controller } from "@nestjs/common";
import { PropertyDetailsDto } from "../dto/propertyDetails.dto";
import { ApiTags } from "@nestjs/swagger";
import { PropertyDetailsService } from "../service/property-details.service";

@ApiTags('Property Details')
@Controller('api/property')
export class PropertyDetailsController {
    constructor(private propertyDetailsService: PropertyDetailsService) {}

    @Post('details')
    @UsePipes(ValidationPipe)
    savePropertyDetails(@Body() propertyDetailsDto: PropertyDetailsDto): Promise<object> {     
      return this.propertyDetailsService.savePropertyDetails(propertyDetailsDto);
    }

}