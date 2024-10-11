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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { SpaceService } from '../service/space.service';
import { Space } from '../entities/space.entity';
import { CreateSpaceDto } from '../dto/requests/space/create-space.dto';
import { UpdateSpaceDto } from '../dto/requests/space/update-space.dto';
import { ApiResponse } from '../commons/response-body/common.responses';
import { FileInterceptor } from '@nestjs/platform-express';
import { validateFile } from '../utils/fileUploadValidation.Util';

@ApiTags('Space')
@Controller('v1/spaces')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post('space')
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new space',
    type: CreateSpaceDto,
  })
  async createSpace(
    @Body() createSpaceDto: CreateSpaceDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ): Promise<ApiResponse<Space>> {
    try {
      if (imageFile) {
        const validationResponse = await validateFile(imageFile);
        if (validationResponse) {
          return validationResponse;
        }
      }
      const result = await this.spaceService.createSpace(
        createSpaceDto,
        imageFile,
      );
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
      const result = await this.spaceService.getAllSpaces();
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
      const result = await this.spaceService.getSpaceById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('space/:id')
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update already existing space',
    type: UpdateSpaceDto,
  })
  async updateSpaceDetail(
    @Param('id') id: string,
    @Body() updateSpaceDto: UpdateSpaceDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ): Promise<ApiResponse<Space>> {
    try {
      if (imageFile) {
        const validationResponse = await validateFile(imageFile);
        if (validationResponse) {
          return validationResponse;
        }
      }
      const result = await this.spaceService.updateSpaceDetailById(
        +id,
        updateSpaceDto,
        imageFile,
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
