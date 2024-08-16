import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PropertyDetailsService } from '../service/property-details.service';
import { CreatePropertyDetailsDto } from '../dto/requests/create-property-details.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdatePropertyDetailsDto } from '../dto/requests/update-property-details.dto';
import { CreatePropertyDetailsResponseDto } from '../dto/responses/create-property-details.dto';
import { UpdatePropertyDetailsResponseDto } from '../dto/responses/update-property-details.dto';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { AuthGuard } from '../commons/guards/auth.guard';

@ApiTags('Property Details')
@Controller('v1/property-details')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertyDetailsController {
  constructor(
    private readonly propertyDetailsService: PropertyDetailsService,
  ) {}
  @Post('property-detail')
  @HttpCode(HttpStatus.CREATED)
  async createPropertyDetails(
    @Body() createPropertyDetailsDto: CreatePropertyDetailsDto,
  ): Promise<CreatePropertyDetailsResponseDto> {
    try {
      return await this.propertyDetailsService.createPropertyDetails(
        createPropertyDetailsDto,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllPropertyDetails(): Promise<object[]> {
    try {
      return await this.propertyDetailsService.getAllPropertyDetails();
    } catch (error) {
      throw error;
    }
  }

  @Get('property-detail/:id')
  @HttpCode(HttpStatus.OK)
  async getPropertyDetailsById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<object> {
    try {
      return await this.propertyDetailsService.getPropertyDetailsById(id);
    } catch (error) {
      throw error;
    }
  }

  @Patch('property-detail/:id')
  @HttpCode(HttpStatus.OK)
  async updatePropertyDetailsById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropertyDetailsDto: UpdatePropertyDetailsDto,
  ): Promise<UpdatePropertyDetailsResponseDto> {
    try {
      return await this.propertyDetailsService.updatePropertyDetailsById(
        id,
        updatePropertyDetailsDto,
      );
    } catch (error) {
      throw error;
    }
  }

  @Delete('property-detail/:id')
  @HttpCode(HttpStatus.OK)
  async deletePropertyDetailsById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<unknown> {
    try {
      return await this.propertyDetailsService.deletePropertyDetailsById(id);
    } catch (error) {
      throw error;
    }
  }
}
