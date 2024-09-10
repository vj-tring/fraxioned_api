import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { SpaceTypes } from '../entities/space-types.entity';
import { SpaceTypesService } from '../service/space-types.service';
import { CreateSpaceTypeDto } from '../dto/requests/space-types/create-space-types.dto';

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
}
