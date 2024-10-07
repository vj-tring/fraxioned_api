import {
  Controller,
  HttpStatus,
  HttpException,
  Get,
  UseGuards,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { ApiResponse } from '../commons/response-body/common.responses';
import { PropertySpaceBathroomService } from '../service/property-space-bathroom.service';
import { PropertySpaceBathroom } from '../entities/property-space-bathroom.entity';
import { CreatePropertySpaceBathroomDto } from '../dto/requests/property-space-bathroom/create-property-space-bathroom.dto';
import { UpdatePropertySpaceBathroomDto } from '../dto/requests/property-space-bathroom/update-property-space-bathroom.dto';

@ApiTags('Property Space Bathroom')
@Controller('v1/property-space-bathrooms')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertySpaceBathroomController {
  constructor(
    private readonly propertySpaceBathroomService: PropertySpaceBathroomService,
  ) {}
  @Post('property-space-bathroom')
  async createPropertySpaceBathroom(
    @Body() createPropertySpaceBathroomDto: CreatePropertySpaceBathroomDto,
  ): Promise<ApiResponse<PropertySpaceBathroom>> {
    try {
      const result =
        await this.propertySpaceBathroomService.createPropertySpaceBathroom(
          createPropertySpaceBathroomDto,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the property space bathroom',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllPropertySpaceBathroom(): Promise<
    ApiResponse<PropertySpaceBathroom[]>
  > {
    try {
      const result =
        await this.propertySpaceBathroomService.getAllPropertySpaceBathroom();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all property space bathroom',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('property-space-bathroom/:id')
  async getPropertySpaceBathroomById(
    @Param('id') id: number,
  ): Promise<ApiResponse<PropertySpaceBathroom>> {
    try {
      const result =
        await this.propertySpaceBathroomService.getPropertySpaceBathroomById(
          id,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the property space bathroom',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('property-space-bathroom/:id')
  async updatePropertySpaceBathroomById(
    @Param('id') id: string,
    @Body() updateProprtySpaceBathroomDto: UpdatePropertySpaceBathroomDto,
  ): Promise<ApiResponse<PropertySpaceBathroom>> {
    try {
      const result =
        await this.propertySpaceBathroomService.updatePropertySpaceBathroomById(
          +id,
          updateProprtySpaceBathroomDto,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the property space bathroom',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('property-space-bathroom/:id')
  async deletePropertySpaceBathroomById(
    @Param('id') id: number,
  ): Promise<ApiResponse<PropertySpaceBathroom>> {
    try {
      const result =
        await this.propertySpaceBathroomService.deletePropertySpaceBathroomById(
          id,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the property space bathroom',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
