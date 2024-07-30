import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UsePipes,
  ValidationPipe,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { HolidaysService } from 'services/holidays.service';
import { LoggerService } from 'services/logger.service';
import { CreateHolidayDto } from 'dto/create-holiday.dto';
import { UpdateHolidayDto } from 'dto/update-holiday.dto';
import { Holidays } from 'entities/holidays.entity';

@Controller('holidays')
export class HolidaysController {
  constructor(
    private readonly holidaysService: HolidaysService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createHoliday(@Body() createHolidayDto: CreateHolidayDto): Promise<{
    success: boolean;
    message: string;
    data?: Holidays;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.holidaysService.create(createHolidayDto);

      if (!result.success) {
        this.logger.error(`Error creating holiday: ${result.message}`);
      }
      return result;
    } catch (error) {
      this.logger.error(
        `Error creating holiday: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  @UsePipes(ValidationPipe)
  async getAllHolidays(): Promise<{
    success: boolean;
    message: string;
    data?: Holidays[];
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.holidaysService.getAllHolidayRecords();

      if (!result.success) {
        this.logger.error(result.message);
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error retrieving all holidays: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all holidays',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @UsePipes(ValidationPipe)
  async getHolidayByDate(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ): Promise<{
    success: boolean;
    message: string;
    data?: Holidays;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.holidaysService.findHolidayByDateRange(
        startDate,
        endDate,
      );

      if (!result.success) {
        this.logger.error(result.message);
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error retrieving holiday: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  async updateHolidayDetail(
    @Param('id') id: string,
    @Body() updateHolidayDto: UpdateHolidayDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: Holidays;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.holidaysService.updateHolidayDetail(
        +id,
        updateHolidayDto,
      );

      if (!result.success) {
        this.logger.error(result.message);
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error updating holiday: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  @UsePipes(ValidationPipe)
  async deleteAllHolidays(): Promise<{
    success: boolean;
    message: string;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.holidaysService.deleteAllHolidays();

      if (!result.success) {
        this.logger.error(result.message);
      }
      return result;
    } catch (error) {
      this.logger.error(
        `Error deleting all holidays: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting all holidays',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @UsePipes(ValidationPipe)
  async deleteHoliday(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result = await this.holidaysService.deleteHolidayById(id);

      if (!result.success) {
        this.logger.error(result.message);
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error deleting holiday: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
