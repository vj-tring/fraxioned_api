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
import {
  getAllowedExtensions,
  getMaxFileSize,
  isFileExtensionValid,
  isFileSizeValid,
} from '../utils/image-file.utils';
import { MEDIA_IMAGE_RESPONSES } from '../commons/constants/response-constants/media-image.constant';

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
      const max_file_size = getMaxFileSize();
      const allowedExtensions = getAllowedExtensions();
      const hasOversizedFile = !isFileSizeValid(imageFile, max_file_size);

      if (hasOversizedFile) {
        return MEDIA_IMAGE_RESPONSES.FILE_SIZE_TOO_LARGE(max_file_size);
      }

      const hasUnsupportedExtension = !isFileExtensionValid(
        imageFile,
        allowedExtensions,
      );

      if (hasUnsupportedExtension) {
        return MEDIA_IMAGE_RESPONSES.UNSUPPORTED_FILE_EXTENSION(
          allowedExtensions,
        );
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
