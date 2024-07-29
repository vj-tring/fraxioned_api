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
} from '@nestjs/common';
import { HolidaysService } from 'src/service/holidays.service';
import { LoggerService } from 'src/service/logger.service';
import { CreateHolidayDto } from 'src/dto/create-holiday.dto';
import { UpdateHolidayDto } from 'src/dto/update-holiday.dto';
import { Holidays } from 'src/entities/holidays.entity';

@Controller('holidays')
export class HolidaysController {
  constructor(
    private readonly holidaysService: HolidaysService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createHoliday(
    @Body() createHolidayDto: CreateHolidayDto,
  ): Promise<{ success: boolean; message: string; data?: Holidays }> {
    const result = await this.holidaysService.create(createHolidayDto);

    if (!result.success) {
      this.logger.error(`Error creating holiday: ${result.message}`);
    }

    return {
      success: result.success,
      message: result.message,
      data: result.data || null,
    };
  }

  @Get('all')
  @UsePipes(ValidationPipe)
  async getAllHolidays(): Promise<{
    success: boolean;
    message: string;
    data?: Holidays[];
  }> {
    const result = await this.holidaysService.getAllHolidayRecords();

    if (!result.success) {
      this.logger.error(result.message);
    }

    return result;
  }

  @Get()
  @UsePipes(ValidationPipe)
  async getHolidayByDate(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ): Promise<{ success: boolean; message: string; data?: Holidays }> {
    const result = await this.holidaysService.findHolidayByDateRange(
      startDate,
      endDate,
    );

    if (!result.success) {
      this.logger.error(result.message);
    }

    return result;
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  async updateHolidayDetail(
    @Param('id') id: string,
    @Body() updateHolidayDto: UpdateHolidayDto,
  ): Promise<{ success: boolean; message: string; data?: Holidays }> {
    const result = await this.holidaysService.updateHolidayDetail(
      +id,
      updateHolidayDto,
    );

    if (!result.success) {
      this.logger.error(result.message);
    }

    return result;
  }

  @Delete()
  @UsePipes(ValidationPipe)
  async deleteAllHolidays(): Promise<{ success: boolean; message: string }> {
    const result = await this.holidaysService.deleteAllHolidays();

    if (!result.success) {
      this.logger.error(result.message);
    }
    return result;
  }

  @Delete(':id')
  @UsePipes(ValidationPipe)
  async deleteHoliday(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.holidaysService.deleteHolidayById(id);

    if (!result.success) {
      this.logger.error(result.message);
    }

    return result;
  }
}
