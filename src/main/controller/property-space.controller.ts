import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { CreatePropertySpaceDto } from '../dto/requests/property-space/create-property-space.dto';
import { ApiResponse } from '../commons/response-body/common.responses';
import { PropertySpace } from '../entities/property-space.entity';
import { PropertySpaceService } from '../service/property-space.service';

@ApiTags('PropertySpace')
@Controller('v1/property-spaces')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertySpaceController {
  constructor(private readonly propertySpaceService: PropertySpaceService) {}

  @Post('property-space')
  async createPropertySpace(
    @Body() createPropertySpaceDto: CreatePropertySpaceDto,
  ): Promise<ApiResponse<PropertySpace>> {
    try {
      const result = await this.propertySpaceService.createPropertySpace(
        createPropertySpaceDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the property space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllPropertySpaces(): Promise<ApiResponse<PropertySpace[]>> {
    try {
      const result = await this.propertySpaceService.getAllPropertySpaces();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all the property spaces',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('property-space/:id')
  async getPropertySpaceById(
    @Param('id') id: number,
  ): Promise<ApiResponse<PropertySpace>> {
    try {
      const result = await this.propertySpaceService.getPropertySpaceById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the property space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('property/:propertyId')
  async getPropertySpaceByPropertyId(
    @Param('propertyId') propertyId: number,
  ): Promise<ApiResponse<PropertySpace[]>> {
    try {
      const result =
        await this.propertySpaceService.getPropertySpaceByPropertyId(
          propertyId,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all the spaces for the selected property',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('property-space/:id')
  async deleteSpaceType(
    @Param('id') id: number,
  ): Promise<ApiResponse<PropertySpace>> {
    try {
      const result = await this.propertySpaceService.removePropertySpace(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the property space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
