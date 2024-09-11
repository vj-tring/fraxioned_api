import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { SpaceTypes } from '../entities/space-types.entity';
import { SpaceTypesService } from '../service/space-types.service';
import { CreateSpaceTypeDto } from '../dto/requests/space-types/create-space-types.dto';
import { UpdateSpaceTypeDto } from '../dto/requests/space-types/update-space-types.dto';

@ApiTags('Space Types')
@Controller('v1/space-types')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class SpaceTypesController {
  constructor(private readonly spaceTypesService: SpaceTypesService) {}

  @Post('space-type')
  async createSpaceType(
    @Body() createSpaceTypeDto: CreateSpaceTypeDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: SpaceTypes;
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.spaceTypesService.createSpaceType(createSpaceTypeDto);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the space type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllSpaceTypes(): Promise<{
    success: boolean;
    message: string;
    data?: SpaceTypes[];
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.spaceTypesService.findAllSpaceTypes();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all space types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('space-type/:id')
  async getSpaceTypeById(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: SpaceTypes;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.spaceTypesService.findSpaceTypeById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the space type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('space-type/:id')
  async updateSpaceTypeDetail(
    @Param('id') id: string,
    @Body() updateSpaceTypeDto: UpdateSpaceTypeDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: SpaceTypes;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.spaceTypesService.updateSpaceType(
        +id,
        updateSpaceTypeDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the space type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('space-type/:id')
  async deleteSpaceType(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result = await this.spaceTypesService.removeSpaceType(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the space type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
