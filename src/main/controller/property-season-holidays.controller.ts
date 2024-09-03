import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PropertySeasonHolidaysService } from '../service/property-season-holidays.service';
import { CreatePropertySeasonHolidayDto } from '../dto/requests/property-season-holiday/create-property-season-holiday.dto';
import { ApiTags } from '@nestjs/swagger';
import { PropertySeasonHolidays } from '../entities/property-season-holidays.entity';
import { UpdatePropertySeasonHolidayDto } from '../dto/requests/property-season-holiday/update-property-season-holiday.dto';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';

@ApiTags('Property Season Holidays')
@Controller('v1/property-season-holidays')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertySeasonHolidaysController {
  constructor(
    private readonly propertySeasonHolidaysService: PropertySeasonHolidaysService,
  ) {}

  @Post('property-season-holiday')
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

  @Get('property-season-holiday/:id')
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

  @Get('property/:id')
  async getHolidaysByPropertyId(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertySeasonHolidays[];
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertySeasonHolidaysService.findHolidaysByPropertyId(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the holidays list for the selected property',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('property-season-holiday/:id')
  async updatePropertySeasonHolidayDetail(
    @Param('id') id: string,
    @Body() updatePropertySeasonHolidayDto: UpdatePropertySeasonHolidayDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySeasonHolidays;
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertySeasonHolidaysService.updatePropertySeasonHoliday(
          +id,
          updatePropertySeasonHolidayDto,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the property season holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('property-season-holiday/:id')
  async deletePropertySeasonHoliday(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result =
        await this.propertySeasonHolidaysService.removePropertySeasonHoliday(
          id,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the property season holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
