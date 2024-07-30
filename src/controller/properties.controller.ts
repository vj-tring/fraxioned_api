import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  //   UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePropertiesDto } from 'src/dto/requests/create-properties.dto';
import { UpdatePropertiesDto } from 'src/dto/requests/update-properties.dto';
import { CommonPropertiesResponseDto } from 'src/dto/responses/common-properties.dto';
import { CreatePropertiesResponseDto } from 'src/dto/responses/create-properties.dto';
import { UpdatePropertiesResponseDto } from 'src/dto/responses/update-properties.dto';
// import { ApiHeader } from '@nestjs/swagger';
import { PropertiesService } from 'src/service/properties.service';

@ApiTags('Properties')
@Controller('api/properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post('property')
  @HttpCode(HttpStatus.CREATED)
  // @UseGuards(AuthGuard)
  // @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  // @ApiHeader({
  //  name: 'access-token',
  //  required: true,
  //  description: 'Access Token',
  //})
  async createProperties(
    @Body() createPropertiesDto: CreatePropertiesDto,
    // @UserAuth() userAuth: { userId: number; accessToken: string },
  ): Promise<CreatePropertiesResponseDto> {
    try {
      return await this.propertiesService.createProperties(createPropertiesDto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthGuard)
  // @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  // @ApiHeader({
  //  name: 'access-token',
  //  required: true,
  //  description: 'Access Token',
  //})
  async getAllProperties(): Promise<CommonPropertiesResponseDto[]> {
    // @UserAuth() userAuth: { userId: number; accessToken: string },
    try {
      return await this.propertiesService.getAllProperties();
    } catch (error) {
      throw error;
    }
  }

  @Get('property/:id')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthGuard)
  // @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  // @ApiHeader({
  //  name: 'access-token',
  //  required: true,
  //  description: 'Access Token',
  //})
  async getPropertiesById(
    // @UserAuth() userAuth: { userId: number; accessToken: string },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommonPropertiesResponseDto> {
    try {
      return await this.propertiesService.getPropertiesById(id);
    } catch (error) {
      throw error;
    }
  }

  @Put('property/:id')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthGuard)
  // @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  // @ApiHeader({
  //  name: 'access-token',
  //  required: true,
  //  description: 'Access Token',
  //})
  async updatePropertiesById(
    // @UserAuth() userAuth: { userId: number; accessToken: string },
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
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthGuard)
  // @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  // @ApiHeader({
  //  name: 'access-token',
  //  required: true,
  //  description: 'Access Token',
  //})
  async deletePropertiesById(
    // @UserAuth() userAuth: { userId: number; accessToken: string },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<unknown> {
    try {
      return await this.propertiesService.deletePropertiesById(id);
    } catch (error) {
      throw error;
    }
  }
}
