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
  // UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HolidaysService } from '../service/holidays.service';
import { CreateHolidayDto } from '../dto/requests/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/requests/update-holiday.dto';
import { Holidays } from '../entities/holidays.entity';
// import { AuthGuard } from '../commons/guards/auth.guard';
// import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';

@ApiTags('Holiday')
@Controller('v1/holidays/holiday')
// @UseGuards(AuthGuard)
// @ApiHeadersForAuth()
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

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

  @Get()
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
