import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PropertyImages } from '../entities/property_images.entity';
import { PropertyImagesService } from '../service/property-images.service';
import { CreatePropertyImagesDto } from '../dto/requests/create-property-images.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PROPERTY_IMAGES_RESPONSES } from '../commons/constants/response-constants/property-images.constant';

@ApiTags('Property Images')
@Controller('v1/propertyImages/propertyImage')
//   @UseGuards(AuthGuard)
//   @ApiHeadersForAuth()
export class PropertyImagesController {
  constructor(private readonly propertyImagesService: PropertyImagesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images[]'))
  async createPropertyImage(
    @Body() createPropertyImagesDto: CreatePropertyImagesDto,
    @UploadedFiles() imageFiles: Express.Multer.File[],
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyImages;
    statusCode: HttpStatus;
  }> {
    try {
      if (
        !imageFiles ||
        imageFiles.length !== createPropertyImagesDto.images.length
      ) {
        return PROPERTY_IMAGES_RESPONSES.IMAGE_FILES_LENGTH_MISMATCH();
      }

      createPropertyImagesDto.images.forEach((imageDto, index) => {
        imageDto.imageFile = imageFiles[index];
      });

      const result = await this.propertyImagesService.createPropertyImages(
        createPropertyImagesDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the property image(s)',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // @Get()
  // async getAllHolidays(): Promise<{
  //   success: boolean;
  //   message: string;
  //   data?: Holidays[];
  //   statusCode: HttpStatus;
  // }> {
  //   try {
  //     const result = await this.holidaysService.getAllHolidayRecords();
  //     return result;
  //   } catch (error) {
  //     throw new HttpException(
  //       'An error occurred while retrieving all holidays',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // @Get(':id')
  // async getHolidayById(@Param('id') id: number): Promise<{
  //   success: boolean;
  //   message: string;
  //   data?: Holidays;
  //   statusCode: HttpStatus;
  // }> {
  //   try {
  //     const result = await this.holidaysService.findHolidayById(id);
  //     return result;
  //   } catch (error) {
  //     throw new HttpException(
  //       'An error occurred while retrieving the holiday',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // @Patch(':id')
  // async updateHolidayDetail(
  //   @Param('id') id: string,
  //   @Body() updateHolidayDto: UpdateHolidayDto,
  // ): Promise<{
  //   success: boolean;
  //   message: string;
  //   data?: Holidays;
  //   statusCode: HttpStatus;
  // }> {
  //   try {
  //     const result = await this.holidaysService.updateHolidayDetail(
  //       +id,
  //       updateHolidayDto,
  //     );
  //     return result;
  //   } catch (error) {
  //     throw new HttpException(
  //       'An error occurred while updating the holiday',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // @Delete(':id')
  // async deleteHoliday(
  //   @Param('id') id: number,
  // ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
  //   try {
  //     const result = await this.holidaysService.deleteHolidayById(id);
  //     return result;
  //   } catch (error) {
  //     throw new HttpException(
  //       'An error occurred while deleting the holiday',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
}
