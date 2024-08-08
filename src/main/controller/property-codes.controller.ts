import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreatePropertyCodeDto } from '../dto/requests/create-property-code.dto';
import { UpdatePropertyCodeDto } from '../dto/requests/update-property-code.dto';
import { PropertyCodesService } from '../service/property-codes.service';

@Controller('property-codes')
export class PropertyCodesController {
  constructor(private readonly propertyCodesService: PropertyCodesService) {}

  @Post()
  async createPropertyCodes(
    @Body() createPropertyCodeDto: CreatePropertyCodeDto,
  ): Promise<object> {
    try {
      return this.propertyCodesService.createPropertyCodes(
        createPropertyCodeDto,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async getAllPropertyCodes(): Promise<object[]> {
    try {
      return await this.propertyCodesService.getAllPropertyCodes();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async getPropertyCodesById(@Param('id') id: string): Promise<object> {
    try {
      return await this.propertyCodesService.getPropertyCodesById(+id);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  async updatePropertyCodesById(
    @Param('id') id: string,
    @Body() updatePropertyCodeDto: UpdatePropertyCodeDto,
  ): Promise<object> {
    try {
      return await this.propertyCodesService.updatePropertyCodesById(
        +id,
        updatePropertyCodeDto,
      );
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async deletePropertyCodesById(@Param('id') id: string): Promise<unknown> {
    try {
      return await this.propertyCodesService.deletePropertyCodesById(+id);
    } catch (error) {
      throw error;
    }
  }
}
