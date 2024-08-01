import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HolidaysService } from '../service/holidays.service';
import { LoggerService } from '../service/logger.service';
import { CreateHolidayDto } from '../dto/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/update-holiday.dto';
import { Holidays } from '../entities/holidays.entity';

@Controller('v1/holidays/holiday')
@ApiTags('Holidays')
export class HolidaysController {
  constructor(
    private readonly holidaysService: HolidaysService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  async createHoliday(@Body() createHolidayDto: CreateHolidayDto): Promise<{
    success: boolean;
    message: string;
    data?: Holidays;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.holidaysService.create(createHolidayDto);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  async getAllHolidays(): Promise<{
    success: boolean;
    message: string;
    data?: Holidays[];
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.holidaysService.getAllHolidayRecords();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all holidays',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getHolidayById(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: Holidays;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.holidaysService.findHolidayById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
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
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteHoliday(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result = await this.holidaysService.deleteHolidayById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
