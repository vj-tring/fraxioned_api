import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CreatePropertyCodeDto } from '../dto/requests/create-property-code.dto';
import { UpdatePropertyCodeDto } from '../dto/requests/update-property-code.dto';
import { PropertyCodesService } from '../service/property-codes.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { AuthGuard } from '../commons/guards/auth.guard';

@ApiTags('Property Codes')
@Controller('v1/property-codes')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertyCodesController {
  constructor(private readonly propertyCodesService: PropertyCodesService) {}

  @Post('property-code')
  async createPropertyCodes(
    @Body() createPropertyCodeDto: CreatePropertyCodeDto,
  ): Promise<object> {
    try {
      return await this.propertyCodesService.createPropertyCodes(
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

  @Get('property-code/:id')
  async getPropertyCodesById(@Param('id') id: number): Promise<object> {
    try {
      return await this.propertyCodesService.getPropertyCodesById(+id);
    } catch (error) {
      throw error;
    }
  }

  @Patch('property-code/:id')
  async updatePropertyCodesById(
    @Param('id') id: number,
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

  @Delete('property-code/:id')
  async deletePropertyCodesById(@Param('id') id: number): Promise<unknown> {
    try {
      return await this.propertyCodesService.deletePropertyCodesById(+id);
    } catch (error) {
      throw error;
    }
  }
}
