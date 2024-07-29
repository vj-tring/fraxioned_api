import { Injectable } from '@nestjs/common';
import { CreateHolidayDto } from 'src/dto/create-holiday.dto';
import { UpdateHolidayDto } from 'src/dto/update-holiday.dto';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Holidays } from 'src/entities/holidays.entity';
import { Repository } from 'typeorm';
import { Users } from 'src/entities/users.entity';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holidays)
    private readonly holidayRepository: Repository<Holidays>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
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

      const user = await this.usersRepository.findOne({
        where: {
          id: createHolidayDto.createdBy.id,
        },
      });

      if (!user) {
        return {
          success: false,
          message: `User with ID ${createHolidayDto.createdBy.id} does not exist`,
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

      this.logger.log(`Retrieved ${holidays.length} holidays successfully.`);

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

  async findHolidayByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<{ success: boolean; message: string; data?: Holidays }> {
    try {
      const holiday = await this.holidayRepository.findOne({
        where: {
          startDate: startDate,
          endDate: endDate,
        },
      });

      if (!holiday) {
        return {
          success: true,
          message: 'No holiday found with the exact start and end dates',
        };
      }

      return {
        success: true,
        message: 'Holiday retrieved successfully',
        data: holiday,
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving holiday: ${error.message} - ${error.stack}`,
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

  async updateHolidayDetail(
    id: number,
    updateHolidayDto: UpdateHolidayDto,
  ): Promise<{
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

      const user = await this.usersRepository.findOne({
        where: {
          id: updateHolidayDto.updatedBy.id,
        },
      });

      if (!user) {
        return {
          success: false,
          message: `User with ID ${updateHolidayDto.updatedBy.id} does not exist`,
        };
      }

      Object.assign(holiday, updateHolidayDto);
      const updatedHoliday = await this.holidayRepository.save(holiday);

      this.logger.log(`Holiday with ID ${id} updated successfully`);

      return {
        success: true,
        message: 'Holiday updated successfully',
        data: updatedHoliday,
      };
    } catch (error) {
      this.logger.error(
        `Error updating holiday with ID ${id}: ${error.message} - ${error.stack}`,
      );
      return {
        success: false,
        message: 'An error occurred while updating the holiday',
      };
    }
  }
}
