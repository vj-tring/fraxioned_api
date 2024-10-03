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
import { SpaceService } from '../service/space.service';
import { Space } from '../entities/space.entity';
import { CreateSpaceDto } from '../dto/requests/space/create-space.dto';
import { UpdateSpaceDto } from '../dto/requests/space/update-space.dto';
import { ApiResponse } from '../commons/response-body/common.responses';

@ApiTags('Space')
@Controller('v1/spaces')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post('space')
  async createSpace(
    @Body() createSpaceDto: CreateSpaceDto,
  ): Promise<ApiResponse<Space>> {
    try {
      const result = await this.spaceService.createSpace(createSpaceDto);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllSpaces(): Promise<ApiResponse<Space[]>> {
    try {
      const result = await this.spaceService.findAllSpaces();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all spaces',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('space/:id')
  async getSpaceById(@Param('id') id: number): Promise<ApiResponse<Space>> {
    try {
      const result = await this.spaceService.findSpaceById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('space/:id')
  async updateSpaceDetail(
    @Param('id') id: string,
    @Body() updateSpaceDto: UpdateSpaceDto,
  ): Promise<ApiResponse<Space>> {
    try {
      const result = await this.spaceService.updateSpaceDetailById(
        +id,
        updateSpaceDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('space/:id')
  async deleteSpace(@Param('id') id: number): Promise<ApiResponse<Space>> {
    try {
      const result = await this.spaceService.deleteSpaceById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
