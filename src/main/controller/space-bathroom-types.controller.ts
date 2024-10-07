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
import { SpaceBathroomTypes } from '../entities/space-bathroom-types.entity';
import { CreateSpaceBathroomTypesDto } from '../dto/requests/space-bathroom-types/create-space-bathroom-types.dto';
import { UpdateSpaceBathroomTypesDto } from '../dto/requests/space-bathroom-types/update-space-bathroom-types.dto';
import { SpaceBathroomTypesService } from '../service/space-bathroom-types.service';

@ApiTags('Space Bathroom Types')
@Controller('v1/space-bathroom-types')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class SpaceBathroomTypesController {
  constructor(
    private readonly spaceBathroomTypesService: SpaceBathroomTypesService,
  ) {}
  @Post('space-bathroom-type')
  async createSpaceBathroomType(
    @Body() createSpaceBathroomTypesDto: CreateSpaceBathroomTypesDto,
  ): Promise<ApiResponse<SpaceBathroomTypes>> {
    try {
      const result =
        await this.spaceBathroomTypesService.createSpaceBathroomType(
          createSpaceBathroomTypesDto,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the space bathroom type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllSpaceBathroomTypes(): Promise<ApiResponse<SpaceBathroomTypes[]>> {
    try {
      const result =
        await this.spaceBathroomTypesService.getAllSpaceBathroomTypes();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all space bathroom types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('space-bathroom-type/:id')
  async getSpaceBathroomTypeById(
    @Param('id') id: number,
  ): Promise<ApiResponse<SpaceBathroomTypes>> {
    try {
      const result =
        await this.spaceBathroomTypesService.getSpaceBathroomTypeById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the space bathroom types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('space-bathroom-type/:id')
  async updateSpaceBathroomTypeById(
    @Param('id') id: string,
    @Body() updateSpaceBathroomTypesDto: UpdateSpaceBathroomTypesDto,
  ): Promise<ApiResponse<SpaceBathroomTypes>> {
    try {
      const result =
        await this.spaceBathroomTypesService.updateSpaceBathroomTypeById(
          +id,
          updateSpaceBathroomTypesDto,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the space bathroom types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('space-bathroom-type/:id')
  async deleteSpaceBathroomTypeById(
    @Param('id') id: number,
  ): Promise<ApiResponse<SpaceBathroomTypes>> {
    try {
      const result =
        await this.spaceBathroomTypesService.deleteSpaceBathroomTypeById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the space bathroom types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
