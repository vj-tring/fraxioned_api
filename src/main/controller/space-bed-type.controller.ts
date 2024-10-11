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
import { SpaceBedTypeService } from '../service/space-bed-type.service';
import { ApiResponse } from '../commons/response-body/common.responses';
import { SpaceBedType } from '../entities/space-bed-type.entity';
import { CreateSpaceBedTypeDto } from '../dto/requests/space-bed-type/create-space-bed-type.dto';
import { UpdateSpaceBedTypeDto } from '../dto/requests/space-bed-type/update-space-bed-type.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Space Bed Types')
@Controller('v1/space-bed-types')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class SpaceBedTypeController {
  constructor(private readonly spaceBedTypeService: SpaceBedTypeService) {}

  @Post('space-bed-type')
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new space bedroom type',
    type: CreateSpaceBedTypeDto,
  })
  async createSpaceBedType(
    @Body() createSpaceBedTypeDto: CreateSpaceBedTypeDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ): Promise<ApiResponse<SpaceBedType>> {
    try {
      if (imageFile) {
        const validationResponse = await validateFile(imageFile);
        if (validationResponse) {
          return validationResponse;
        }
      }
      const result = await this.spaceBedTypeService.createSpaceBedType(
        createSpaceBedTypeDto,
        imageFile,
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
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update already existing space bathroom type',
    type: UpdateSpaceBedTypeDto,
  })
  async updateSpaceBedTypeDetail(
    @Param('id') id: string,
    @Body() updateSpaceBedTypeDto: UpdateSpaceBedTypeDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ): Promise<ApiResponse<SpaceBedType>> {
    try {
      if (imageFile) {
        const validationResponse = await validateFile(imageFile);
        if (validationResponse) {
          return validationResponse;
        }
      }
      const result = await this.spaceBedTypeService.updateSpaceBedTypeById(
        +id,
        updateSpaceBedTypeDto,
        imageFile,
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
