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
import { CreatePropertySpaceBedDto } from '../dto/requests/property-space-bed/create-property-space-bed.dto';
import { UpdatePropertySpaceBedDto } from '../dto/requests/property-space-bed/update-property-space-bed.dto';
import { CreateOrDeletePropertySpaceBedsDto } from '../dto/requests/property-space-bed/create-or-delete.dto';
import { PropertySpaceBedService } from '../service/property-space-bed.service';
import { PropertySpaceBed } from '../entities/property-space-bed.entity';

@ApiTags('PropertySpaceBed')
@Controller('v1/property-space-beds')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertySpaceBedController {
  constructor(
    private readonly propertySpaceBedService: PropertySpaceBedService,
  ) {}

  @Post('property-space-bed')
  async createPropertySpaceBed(
    @Body() createPropertySpaceBedDto: CreatePropertySpaceBedDto,
  ): Promise<ApiResponse<PropertySpaceBed>> {
    try {
      const result = await this.propertySpaceBedService.createPropertySpaceBed(
        createPropertySpaceBedDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the property space bed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('property-space-bed')
  async getAllPropertySpaceBeds(): Promise<ApiResponse<PropertySpaceBed[]>> {
    try {
      const result =
        await this.propertySpaceBedService.getAllPropertySpaceBeds();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all property space beds',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('property-space-bed/:id')
  async getPropertySpaceBedById(
    @Param('id') id: number,
  ): Promise<ApiResponse<PropertySpaceBed>> {
    try {
      const result =
        await this.propertySpaceBedService.getPropertySpaceBedById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the property space bed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('property-space-bed/:id')
  async updatePropertySpaceBedDetail(
    @Param('id') id: string,
    @Body() updatePropertySpaceBedDto: UpdatePropertySpaceBedDto,
  ): Promise<ApiResponse<PropertySpaceBed>> {
    try {
      const result =
        await this.propertySpaceBedService.updatePropertySpaceBedById(
          +id,
          updatePropertySpaceBedDto,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the property space bed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('property-space-bed/:id')
  async deletePropertySpaceBed(
    @Param('id') id: number,
  ): Promise<ApiResponse<PropertySpaceBed>> {
    try {
      const result =
        await this.propertySpaceBedService.deletePropertySpaceBedById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the property space bed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Patch()
  async createOrDeletePropertySpaceBeds(
    @Body()
    createOrDeletePropertySpaceBedsDto: CreateOrDeletePropertySpaceBedsDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceBed[];
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertySpaceBedService.createOrDeletePropertySpaceBeds(
          createOrDeletePropertySpaceBedsDto,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creation or deletion of property space beds for the selected property space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
