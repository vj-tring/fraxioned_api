import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CommonPropertiesResponseDto } from 'src/main/dto/responses/common-properties.dto';
import { CreatePropertiesResponseDto } from 'src/main/dto/responses/create-properties.dto';
import { UpdatePropertiesResponseDto } from 'src/main/dto/responses/update-properties.dto';
import { PropertiesService } from 'src/main/service/properties.service';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { PropertyWithDetailsResponseDto } from '../dto/responses/PropertyWithDetailsResponseDto.dto';
import { CreatePropertiesDto } from '../dto/requests/property/create-property.dto';
import { UpdatePropertiesDto } from '../dto/requests/property/update-properties.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { validateFile } from '../utils/fileUploadValidation.Util';
import { ApiResponse } from '../commons/response-body/common.responses';
import { FindPropertyImagesData } from '../dto/responses/find-property-images-response.dto';

@ApiTags('Properties')
@Controller('v1/properties')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  private getUserIdFromRequest(req: Request): number {
    const userId = req.headers['user-id'];
    return userId ? parseInt(userId as string, 10) : 0;
  }

  @Post('property')
  async createProperties(
    @Body() createPropertiesDto: CreatePropertiesDto,
  ): Promise<CreatePropertiesResponseDto> {
    try {
      return await this.propertiesService.createProperties(createPropertiesDto);
    } catch (error) {
      throw error;
    }
  }

  @Patch('property/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mailBannerFile', maxCount: 1 },
      { name: 'coverImageFile', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  async updatePropertiesById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropertiesDto: UpdatePropertiesDto,
    @UploadedFiles()
    files: {
      mailBannerFile?: Express.Multer.File[];
      coverImageFile?: Express.Multer.File[];
    },
  ): Promise<UpdatePropertiesResponseDto | object> {
    try {
      const mailBannerFile = files.mailBannerFile
        ? files.mailBannerFile[0]
        : undefined;
      const coverImageFile = files.coverImageFile
        ? files.coverImageFile[0]
        : undefined;

      if (mailBannerFile) {
        const validationResponse = await validateFile(mailBannerFile);
        if (validationResponse) {
          return validationResponse;
        }
      }
      if (coverImageFile) {
        const validationResponse = await validateFile(coverImageFile);
        if (validationResponse) {
          return validationResponse;
        }
      }

      return await this.propertiesService.updatePropertiesById(
        id,
        updatePropertiesDto,
        mailBannerFile,
        coverImageFile,
      );
    } catch (error) {
      throw error;
    }
  }

  @Delete('property/:id')
  async deletePropertiesById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<unknown> {
    try {
      return await this.propertiesService.deletePropertiesById(id);
    } catch (error) {
      throw error;
    }
  }

  @Post('compare-properties')
  async compareAndUpdateProperties(): Promise<CommonPropertiesResponseDto[]> {
    try {
      return await this.propertiesService.compareAndUpdateProperties();
    } catch (error) {
      throw new HttpException(
        'An error occurred while comparing and updating properties',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllProperties(
    @Req() req: Request,
  ): Promise<CommonPropertiesResponseDto[]> {
    try {
      const userId = this.getUserIdFromRequest(req);
      return await this.propertiesService.getAllProperties(userId);
    } catch (error) {
      throw error;
    }
  }

  @Get('property/:id')
  async getPropertiesById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<CommonPropertiesResponseDto> {
    try {
      const userId = this.getUserIdFromRequest(req);
      return await this.propertiesService.getPropertiesById(id, userId);
    } catch (error) {
      throw error;
    }
  }

  @Get('property/:id/details')
  async getPropertyWithDetailsById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<PropertyWithDetailsResponseDto | object> {
    try {
      const userId = this.getUserIdFromRequest(req);
      return await this.propertiesService.getPropertiesWithDetails(id, userId);
    } catch (error) {
      throw new HttpException(
        `An error occurred while fetching property details for ID ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('properties-with-details')
  async getAllPropertiesWithDetails(
    @Req() req: Request,
  ): Promise<PropertyWithDetailsResponseDto[] | object> {
    try {
      const requestedUser = this.getUserIdFromRequest(req);
      return await this.propertiesService.getPropertiesWithDetails(
        undefined,
        requestedUser,
      );
    } catch (error) {
      throw new HttpException(
        'An error occurred while fetching properties with details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':userId/user-properties-with-details')
  async getAllPropertiesWithDetailsByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: Request,
  ): Promise<PropertyWithDetailsResponseDto[] | object> {
    try {
      const requestedUser = this.getUserIdFromRequest(req);
      return await this.propertiesService.getAllPropertiesWithDetailsByUser(
        userId,
        requestedUser,
      );
    } catch (error) {
      throw new HttpException(
        'An error occurred while fetching properties with details for the user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('property/:id/room-details')
  async getRoomDetailsByPropertyId(
    @Param('id') propertyId: number,
  ): Promise<ApiResponse<FindPropertyImagesData>> {
    try {
      const result =
        await this.propertiesService.findPropertyImagesByPropertyId(propertyId);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the property images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
