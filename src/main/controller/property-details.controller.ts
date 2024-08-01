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
} from '@nestjs/common';
import { PropertyDetailsService } from '../service/property-details.service';
import { CreatePropertyDetailsDto } from '../dto/requests/create-property-details.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdatePropertyDetailsDto } from '../dto/requests/update-property-details.dto';
import { CreatePropertyDetailsResponseDto } from '../dto/responses/create-property-details.dto';
import { UpdatePropertyDetailsResponseDto } from '../dto/responses/update-property-details.dto';

@ApiTags('Property Details')
@Controller('api/v1/property-details')
export class PropertyDetailsController {
  constructor(
    private readonly propertyDetailsService: PropertyDetailsService,
  ) {}
  @Post('property-detail')
  @HttpCode(HttpStatus.CREATED)
  // @UseGuards(AuthGuard)
  // @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  // @ApiHeader({
  //  name: 'access-token',
  //  required: true,
  //  description: 'Access Token',
  //})
  async createPropertyDetails(
    @Body() createPropertyDetailsDto: CreatePropertyDetailsDto,
    // @UserAuth() userAuth: { userId: number; accessToken: string },
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
  // @UseGuards(AuthGuard)
  // @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  // @ApiHeader({
  //  name: 'access-token',
  //  required: true,
  //  description: 'Access Token',
  //})
  async getAllPropertyDetails(): Promise<object[]> {
    // @UserAuth() userAuth: { userId: number; accessToken: string },
    try {
      return await this.propertyDetailsService.getAllPropertyDetails();
    } catch (error) {
      throw error;
    }
  }

  @Get('property-detail/:id')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthGuard)
  // @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  // @ApiHeader({
  //  name: 'access-token',
  //  required: true,
  //  description: 'Access Token',
  //})
  async getPropertyDetailsById(
    // @UserAuth() userAuth: { userId: number; accessToken: string },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<object> {
    try {
      return await this.propertyDetailsService.getPropertyDetailsById(id);
    } catch (error) {
      throw error;
    }
  }

  @Put('property-detail/:id')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthGuard)
  // @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  // @ApiHeader({
  //  name: 'access-token',
  //  required: true,
  //  description: 'Access Token',
  //})
  async updatePropertyDetailsById(
    // @UserAuth() userAuth: { userId: number; accessToken: string },
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
  // @UseGuards(AuthGuard)
  // @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  // @ApiHeader({
  //  name: 'access-token',
  //  required: true,
  //  description: 'Access Token',
  //})
  async deletePropertyDetailsById(
    // @UserAuth() userAuth: { userId: number; accessToken: string },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<unknown> {
    try {
      return await this.propertyDetailsService.deletePropertyDetailsById(id);
    } catch (error) {
      throw error;
    }
  }
}
