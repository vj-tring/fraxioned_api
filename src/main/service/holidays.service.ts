import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHolidayDto } from '../dto/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/update-holiday.dto';
import { Holidays } from '../entities/holidays.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holidays)
    private readonly holidayRepository: Repository<Holidays>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly logger: LoggerService,
  ) {}

  async create(createHolidayDto: CreateHolidayDto): Promise<{
    success: boolean;
    message: string;
    data?: Holidays;
    statusCode: number;
  }> {
    try {
      this.logger.log(
        `Creating holiday ${createHolidayDto.name} for the year ${createHolidayDto.year}`,
      );
      const existingHoliday = await this.holidayRepository.findOne({
        where: {
          name: createHolidayDto.name,
          year: createHolidayDto.year,
        },
      });

      if (existingHoliday) {
        this.logger.error(
          `Error creating holiday: Holiday ${createHolidayDto.name} for the year ${createHolidayDto.year} already exists`,
        );

        return {
          success: false,
          message: `Holiday ${createHolidayDto.name} for the year ${createHolidayDto.year} already exists`,
          statusCode: HttpStatus.CONFLICT,
        };
      }

      const user = await this.usersRepository.findOne({
        where: {
          id: createHolidayDto.createdBy.id,
        },
      });

      if (!user) {
        this.logger.error(
          `User with ID ${createHolidayDto.createdBy.id} does not exist`,
        );

        return {
          success: false,
          message: `User with ID ${createHolidayDto.createdBy.id} does not exist`,
          statusCode: HttpStatus.NOT_FOUND,
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
        statusCode: HttpStatus.CREATED,
      };
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

  async getAllHolidayRecords(): Promise<{
    success: boolean;
    message: string;
    data?: Holidays[];
    statusCode: number;
  }> {
    try {
      const holidays = await this.holidayRepository.find();

      if (holidays.length === 0) {
        this.logger.log(`No holidays are available`);

        return {
          success: true,
          message: 'No holidays are available',
          data: [],
          statusCode: HttpStatus.OK,
        };
      }

      this.logger.log(`Retrieved ${holidays.length} holidays successfully.`);

      return {
        success: true,
        message: 'Holidays retrieved successfully',
        data: holidays,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving holidays: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findHolidayById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: Holidays;
    statusCode: number;
  }> {
    try {
      const holiday = await this.holidayRepository.findOne({
        where: { id },
      });

      if (!holiday) {
        this.logger.error(`Holiday with ID ${id} not found`);
        return {
          success: false,
          message: `Holiday with ID ${id} not found`,
          statusCode: HttpStatus.NOT_FOUND,
        };
      }
      this.logger.log(`Holiday with ID ${id} retrieved successfully`);
      return {
        success: true,
        message: 'Holiday retrieved successfully',
        data: holiday,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving holiday with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateHolidayDetail(
    id: number,
    updateHolidayDto: UpdateHolidayDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: Holidays;
    statusCode: number;
  }> {
    try {
      const holiday = await this.holidayRepository.findOne({
        where: { id },
      });

      if (!holiday) {
        this.logger.error(`Holiday with ID ${id} not found`);
        return {
          success: false,
          message: `Holiday with ID ${id} not found`,
          statusCode: HttpStatus.NOT_FOUND,
        };
      }

      const user = await this.usersRepository.findOne({
        where: {
          id: updateHolidayDto.updatedBy.id,
        },
      });

      if (!user) {
        this.logger.error(
          `User with ID ${updateHolidayDto.updatedBy.id} does not exist`,
        );
        return {
          success: false,
          message: `User with ID ${updateHolidayDto.updatedBy.id} does not exist`,
          statusCode: HttpStatus.NOT_FOUND,
        };
      }

      Object.assign(holiday, updateHolidayDto);
      const updatedHoliday = await this.holidayRepository.save(holiday);

      this.logger.log(`Holiday with ID ${id} updated successfully`);

      return {
        success: true,
        message: 'Holiday updated successfully',
        data: updatedHoliday,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      this.logger.error(
        `Error updating holiday with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteHolidayById(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const result = await this.holidayRepository.delete(id);
      this.logger.error(`Holiday with ID ${id} not found`);
      if (result.affected === 0) {
        return {
          success: false,
          message: `Holiday with ID ${id} not found`,
          statusCode: HttpStatus.NOT_FOUND,
        };
      }

      this.logger.log(`Holiday with ID ${id} deleted successfully`);
      return {
        success: true,
        message: `Holiday with ID ${id} deleted successfully`,
        statusCode: HttpStatus.NO_CONTENT,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting holiday with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
