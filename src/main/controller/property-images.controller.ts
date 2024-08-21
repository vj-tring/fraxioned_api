import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { PropertyImagesService } from '../service/property-images.service';
import { CreatePropertyImagesDto } from '../dto/requests/create-property-images.dto';

@ApiTags('Property Images')
@Controller('v1/propertyImages/propertyImage')
export class PropertyImagesController {
  constructor(private readonly propertyImagesService: PropertyImagesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imageFile'))
  async createPropertyImage(
    @Body() createPropertyImagesDto: CreatePropertyImagesDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ): Promise<void> {
    try {
      console.log('Type of imageFile:', typeof imageFile);
      console.log('Received Image File:', imageFile);
      console.log('Received DTO:', createPropertyImagesDto);

      if (!imageFile) {
        throw new HttpException(
          'Image file is required please',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Proceed with your logic here
      // const result = await this.propertyImagesService.createPropertyImages(createPropertyImagesDto);
      // return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the property image(s)',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
