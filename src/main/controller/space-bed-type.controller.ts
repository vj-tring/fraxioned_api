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
import { SpaceBedTypeService } from '../service/space-bed-type.service';
import { ApiResponse } from '../commons/response-body/common.responses';
import { SpaceBedType } from '../entities/space-bed-type.entity';
import { CreateSpaceBedTypeDto } from '../dto/requests/space-bed-type/create-space-bed-type.dto';
import { UpdateSpaceBedTypeDto } from '../dto/requests/space-bed-type/update-space-bed-type.dto';

@ApiTags('SpaceBedType')
@Controller('v1/space-bed-types')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class SpaceBedTypeController {
  constructor(private readonly spaceBedTypeService: SpaceBedTypeService) {}

  @Post('space-bed-type')
  async createSpaceBedType(
    @Body() createSpaceBedTypeDto: CreateSpaceBedTypeDto,
  ): Promise<ApiResponse<SpaceBedType>> {
    try {
      const result = await this.spaceBedTypeService.createSpaceBedType(
        createSpaceBedTypeDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the space bed type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllSpaceBedTypes(): Promise<ApiResponse<SpaceBedType[]>> {
    try {
      const result = await this.spaceBedTypeService.getAllSpaceBedTypes();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all space bed types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('space-bed-type/:id')
  async getSpaceBedTypeById(
    @Param('id') id: number,
  ): Promise<ApiResponse<SpaceBedType>> {
    try {
      const result = await this.spaceBedTypeService.getSpaceBedTypeById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the space bed type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('space-bed-type/:id')
  async updateSpaceBedTypeDetail(
    @Param('id') id: string,
    @Body() updateSpaceBedTypeDto: UpdateSpaceBedTypeDto,
  ): Promise<ApiResponse<SpaceBedType>> {
    try {
      const result = await this.spaceBedTypeService.updateSpaceBedTypeById(
        +id,
        updateSpaceBedTypeDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the space bed type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('space-bed-type/:id')
  async deleteSpaceBedType(
    @Param('id') id: number,
  ): Promise<ApiResponse<SpaceBedType>> {
    try {
      const result = await this.spaceBedTypeService.deleteSpaceBedTypeById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the space bed type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
