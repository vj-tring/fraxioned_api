import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { CreatePropertyCodeDto } from '../dto/requests/property-code/create-property-code.dto';
import { UpdatePropertyCodeDto } from '../dto/requests/property-code/update-property-code.dto';
import { PropertyCodesService } from '../service/property-codes.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { AuthGuard } from '../commons/guards/auth.guard';
import { PropertyCodes } from '../entities/property_codes.entity';

@ApiTags('Property Codes')
@Controller('v1/property-codes')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertyCodesController {
  constructor(private readonly propertyCodesService: PropertyCodesService) {}

  @Post('property-code')
  async createPropertyCodes(
    @Body() createPropertyCodeDto: CreatePropertyCodeDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyCodes;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.propertyCodesService.createPropertyCodes(
        createPropertyCodeDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the property code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllPropertyCodes(): Promise<{
    success: boolean;
    message: string;
    data?: PropertyCodes[];
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.propertyCodesService.findAllPropertyCodes();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all the property codes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('property-code/:id')
  async getPropertyCodeById(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertyCodes;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.propertyCodesService.findPropertyCodeById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the property code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('property-code/:id')
  async updatePropertyCodeDetail(
    @Param('id') id: string,
    @Body() updatePropertyCodeDto: UpdatePropertyCodeDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyCodes;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.propertyCodesService.updatePropertyCodeById(
        +id,
        updatePropertyCodeDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the property code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('property-code/:id')
  async deletePropertyCodeById(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result = await this.propertyCodesService.removePropertyCode(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the property code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
