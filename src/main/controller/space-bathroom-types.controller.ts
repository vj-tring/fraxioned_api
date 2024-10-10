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
import { ApiResponse } from '../commons/response-body/common.responses';
import { SpaceBathroomTypes } from '../entities/space-bathroom-types.entity';
import { CreateSpaceBathroomTypesDto } from '../dto/requests/space-bathroom-types/create-space-bathroom-types.dto';
import { UpdateSpaceBathroomTypesDto } from '../dto/requests/space-bathroom-types/update-space-bathroom-types.dto';
import { SpaceBathroomTypesService } from '../service/space-bathroom-types.service';
import { MEDIA_IMAGE_RESPONSES } from '../commons/constants/response-constants/media-image.constant';
import {
  getMaxFileSize,
  getAllowedExtensions,
  isFileSizeValid,
  isFileExtensionValid,
} from '../utils/image-file.utils';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Space Bathroom Types')
@Controller('v1/space-bathroom-types')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class SpaceBathroomTypesController {
  constructor(
    private readonly spaceBathroomTypesService: SpaceBathroomTypesService,
  ) {}

  async validateFile(
    imageFile: Express.Multer.File,
  ): Promise<ApiResponse<null>> {
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
    return null;
  }

  @Post('space-bathroom-type')
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new space bathroom type',
    type: CreateSpaceBathroomTypesDto,
  })
  async createSpaceBathroomType(
    @Body() createSpaceBathroomTypesDto: CreateSpaceBathroomTypesDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ): Promise<ApiResponse<SpaceBathroomTypes>> {
    try {
      if (imageFile) {
        const validationResponse = await this.validateFile(imageFile);
        if (validationResponse) {
          return validationResponse;
        }
      }
      const result =
        await this.spaceBathroomTypesService.createSpaceBathroomType(
          createSpaceBathroomTypesDto,
          imageFile,
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
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update already existing space bathroom type',
    type: UpdateSpaceBathroomTypesDto,
  })
  async updateSpaceBathroomTypeById(
    @Param('id') id: string,
    @Body() updateSpaceBathroomTypesDto: UpdateSpaceBathroomTypesDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ): Promise<ApiResponse<SpaceBathroomTypes>> {
    try {
      if (imageFile) {
        const validationResponse = await this.validateFile(imageFile);
        if (validationResponse) {
          return validationResponse;
        }
      }
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
