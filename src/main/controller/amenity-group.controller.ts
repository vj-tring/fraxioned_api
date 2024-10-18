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
import { AmenityGroupService } from '../service/amenity-group.service';
import { ApiResponse } from '../commons/response-body/common.responses';
import { AmenityGroup } from '../entities/amenity-group.entity';
import { CreateAmenityGroupDto } from '../dto/requests/amenity-group/create-amenity-group.dto';
import { UpdateAmenityGroupDto } from '../dto/requests/amenity-group/update-amenity-group.dto';

@ApiTags('AmenityGroup')
@Controller('v1/amenity-groups')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class AmenityGroupController {
  constructor(private readonly amenityGroupService: AmenityGroupService) {}

  @Post('amenity-group')
  async createAmenityGroup(
    @Body() createAmenityGroupDto: CreateAmenityGroupDto,
  ): Promise<ApiResponse<AmenityGroup>> {
    try {
      const result = await this.amenityGroupService.createAmenityGroup(
        createAmenityGroupDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the amenity group',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllAmenityGroups(): Promise<ApiResponse<AmenityGroup[]>> {
    try {
      const result = await this.amenityGroupService.getAllAmenityGroups();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all amenity groups',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('amenity-group/:id')
  async getAmenityGroupById(
    @Param('id') id: number,
  ): Promise<ApiResponse<AmenityGroup>> {
    try {
      const result = await this.amenityGroupService.getAmenityGroupById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the amenity group',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('amenity-group/:id')
  async updateAmenityGroupDetail(
    @Param('id') id: string,
    @Body() updateAmenityGroupDto: UpdateAmenityGroupDto,
  ): Promise<ApiResponse<AmenityGroup>> {
    try {
      const result = await this.amenityGroupService.updateAmenityGroupById(
        +id,
        updateAmenityGroupDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the amenity group',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('amenity-group/:id')
  async deleteAmenityGroup(
    @Param('id') id: number,
  ): Promise<ApiResponse<AmenityGroup>> {
    try {
      const result = await this.amenityGroupService.deleteAmenityGroupById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the amenity group',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
