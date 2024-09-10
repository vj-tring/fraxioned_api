import {
  Controller,
  HttpStatus,
  HttpException,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { SpaceService } from '../service/space.service';
import { Space } from '../entities/space.entity';

@ApiTags('Spaces')
@Controller('v1/Spaces')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Get()
  async getAllSpaces(): Promise<{
    success: boolean;
    message: string;
    data?: Space[];
    statusCode: HttpStatus;
  }> {
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
}
