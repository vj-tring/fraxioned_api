import { Injectable } from '@nestjs/common';
import { CreateHolidayDto } from 'src/dto/create-holiday.dto';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Holidays } from 'src/entities/holidays.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holidays)
    private readonly holidayRepository: Repository<Holidays>,
    private readonly logger: LoggerService,
  ) {}

  async create(createHolidayDto: CreateHolidayDto): Promise<{
    success: boolean;
    message: string;
    data?: Holidays;
  }> {
    try {
      this.logger.log(
        `Creating holiday ${createHolidayDto.name}  for the year ${createHolidayDto.year}`,
      );
      const existingHoliday = await this.holidayRepository.findOne({
        where: {
          name: createHolidayDto.name,
          year: createHolidayDto.year,
        },
      });

      if (existingHoliday) {
        return {
          success: false,
          message: `Holiday ${createHolidayDto.name} for the year ${createHolidayDto.year} already exists`,
        };
      }
      const holiday = this.holidayRepository.create({
        ...createHolidayDto,
      });
      const savedHoliday = await this.holidayRepository.save(holiday);
      this.logger.log(
        `Holiday ${createHolidayDto.name} created with ID ${savedHoliday.id}`,
      );
      return {
        success: true,
        message: 'Holiday created successfully',
        data: savedHoliday,
      };
    } catch (error) {
      this.logger.error(
        `Error creating holiday: ${error.message} - ${error.stack}`,
      );
      return {
        success: false,
        message: 'An error occurred while creating the holiday',
      };
    }
  }

  async getAllHolidayRecords(): Promise<{
    success: boolean;
    message: string;
    data?: Holidays[];
  }> {
    try {
      const holidays = await this.holidayRepository.find();

      if (holidays.length === 0) {
        return {
          success: true,
          message: 'No holidays found',
          data: [],
        };
      }

      return {
        success: true,
        message: 'Holidays retrieved successfully',
        data: holidays,
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving holidays: ${error.message} - ${error.stack}`,
      );
      return {
        success: false,
        message: 'An error occurred while retrieving holidays',
      };
    }
  }

  async findHolidayById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: Holidays;
  }> {
    try {
      const holiday = await this.holidayRepository.findOne({
        where: { id },
      });

      if (!holiday) {
        return {
          success: false,
          message: `Holiday with ID ${id} not found`,
        };
      }

      return {
        success: true,
        message: 'Holiday retrieved successfully',
        data: holiday,
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving holiday with ID ${id}: ${error.message} - ${error.stack}`,
      );
      return {
        success: false,
        message: 'An error occurred while retrieving the holiday',
      };
    }
  }

  async deleteAllHolidays(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const result = await this.holidayRepository.delete({});

      if (result.affected === 0) {
        return {
          success: true,
          message: 'No holidays found to delete',
        };
      }

      this.logger.log(`Deleted ${result.affected} holidays successfully`);
      return {
        success: true,
        message: `Deleted ${result.affected} holidays successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting holidays: ${error.message} - ${error.stack}`,
      );
      return {
        success: false,
        message: 'An error occurred while deleting holidays',
      };
    }
  }

  async deleteHolidayById(id: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const result = await this.holidayRepository.delete(id);

      if (result.affected === 0) {
        return {
          success: false,
          message: `Holiday with ID ${id} not found`,
        };
      }

      this.logger.log(`Holiday with ID ${id} deleted successfully`);
      return {
        success: true,
        message: `Holiday with ID ${id} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting holiday with ID ${id}: ${error.message} - ${error.stack}`,
      );
      return {
        success: false,
        message: 'An error occurred while deleting the holiday',
      };
    }
  }
}
