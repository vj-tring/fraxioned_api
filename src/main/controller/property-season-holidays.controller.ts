import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Get,
  Param,
} from '@nestjs/common';
import { PropertySeasonHolidaysService } from '../service/property-season-holidays.service';
import { CreatePropertySeasonHolidayDto } from '../dto/create-property-season-holiday.dto';
import { ApiTags } from '@nestjs/swagger';
import { PropertySeasonHolidays } from '../entities/property-season-holidays.entity';

@ApiTags('Property Season Holidays')
@Controller('v1/property-season-holidays/property-season-holiday')
export class PropertySeasonHolidaysController {
  constructor(
    private readonly propertySeasonHolidaysService: PropertySeasonHolidaysService,
  ) {}

  @Post()
  async createPropertySeasonHoliday(
    @Body() createPropertySeasonHolidayDto: CreatePropertySeasonHolidayDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySeasonHolidays;
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertySeasonHolidaysService.createPropertySeasonHoliday(
          createPropertySeasonHolidayDto,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the property season holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllPropertySeasonHolidays(): Promise<{
    success: boolean;
    message: string;
    data?: PropertySeasonHolidays[];
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertySeasonHolidaysService.findAllPropertySeasonHolidays();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all property season holidays',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getPropertySeasonHolidayById(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertySeasonHolidays;
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertySeasonHolidaysService.findPropertySeasonHolidayById(
          id,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the property season holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // @Patch(':id')
  // async updatePropertySeasonHolidayDetail(
  //   @Param('id') id: string,
  //   @Body() updatePropertySeasonHolidayDto: UpdatePropertySeasonHolidayDto,
  // ): Promise<{
  //   success: boolean;
  //   message: string;
  //   data?: PropertySeasonHolidays;
  //   statusCode: HttpStatus;
  // }>  {
  //   try {
  //     const result = await this.propertySeasonHolidaysService.updatePropertySeasonHoliday(
  //       +id,
  //       updatePropertySeasonHolidayDto,
  //     );
  //     return result;
  //   } catch (error) {
  //     throw new HttpException(
  //       'An error occurred while updating the property season holiday',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }

  // }

  // @Delete(':id')
  // async deletePropertySeasonHoliday(@Param('id') id: number): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
  //   try {
  //     const result = await this.propertySeasonHolidaysService.removePropertySeasonHoliday(id);
  //     return result;
  //   } catch (error) {
  //     throw new HttpException(
  //       'An error occurred while deleting the property season holiday',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }

  // }
}
