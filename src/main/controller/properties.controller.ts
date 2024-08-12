import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePropertiesDto } from 'src/main/dto/requests/create-property.dto';
import { UpdatePropertiesDto } from 'src/main/dto/requests/update-properties.dto';
import { CommonPropertiesResponseDto } from 'src/main/dto/responses/common-properties.dto';
import { CreatePropertiesResponseDto } from 'src/main/dto/responses/create-properties.dto';
import { UpdatePropertiesResponseDto } from 'src/main/dto/responses/update-properties.dto';
import { PropertiesService } from 'src/main/service/properties.service';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';

@ApiTags('Properties')
@Controller('v1/properties')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post('property')
  async createProperties(
    @Body() createPropertiesDto: CreatePropertiesDto,
  ): Promise<CreatePropertiesResponseDto> {
    try {
      return await this.propertiesService.createProperties(createPropertiesDto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async getAllProperties(): Promise<CommonPropertiesResponseDto[]> {
    try {
      return await this.propertiesService.getAllProperties();
    } catch (error) {
      throw error;
    }
  }

  @Get('property/:id')
  async getPropertiesById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommonPropertiesResponseDto> {
    try {
      return await this.propertiesService.getPropertiesById(id);
    } catch (error) {
      throw error;
    }
  }

  @Patch('property/:id')
  async updatePropertiesById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropertiesDto: UpdatePropertiesDto,
  ): Promise<UpdatePropertiesResponseDto> {
    try {
      return await this.propertiesService.updatePropertiesById(
        id,
        updatePropertiesDto,
      );
    } catch (error) {
      throw error;
    }
  }

  @Delete('property/:id')
  async deletePropertiesById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<unknown> {
    try {
      return await this.propertiesService.deletePropertiesById(id);
    } catch (error) {
      throw error;
    }
  }
}
