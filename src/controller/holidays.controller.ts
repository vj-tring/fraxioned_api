import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { HolidaysService } from 'src/service/holidays.service';
import { LoggerService } from 'src/service/logger.service';
import { CreateHolidayDto } from 'src/dto/create-holiday.dto';

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

  @Get()
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

  @Get(':id')
  @UsePipes(ValidationPipe)
  async getHoliday(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string; data?: Holidays }> {
    const result = await this.holidaysService.findHolidayById(+id);

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
import { Holidays } from 'src/entities/holidays.entity';
