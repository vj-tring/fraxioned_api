import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHolidayDto } from '../dto/requests/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/requests/update-holiday.dto';
import { Holidays } from '../entities/holidays.entity';
import { User } from '../entities/user.entity';
import { HOLIDAYS_RESPONSES } from '../commons/constants/holidays-response.constants';
import { PropertySeasonHolidays } from '../entities/property-season-holidays.entity';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holidays)
    private readonly holidayRepository: Repository<Holidays>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(PropertySeasonHolidays)
    private readonly propertySeasonHolidayRepository: Repository<PropertySeasonHolidays>,
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

        return HOLIDAYS_RESPONSES.HOLIDAY_ALREADY_EXISTS(
          createHolidayDto.name,
          createHolidayDto.year,
        );
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

        return HOLIDAYS_RESPONSES.USER_NOT_FOUND(createHolidayDto.createdBy.id);
      }

      const holiday = this.holidayRepository.create({
        ...createHolidayDto,
      });
      const savedHoliday = await this.holidayRepository.save(holiday);
      this.logger.log(
        `Holiday ${createHolidayDto.name} created with ID ${savedHoliday.id}`,
      );
      return HOLIDAYS_RESPONSES.HOLIDAY_CREATED(savedHoliday);
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

        return HOLIDAYS_RESPONSES.HOLIDAYS_NOT_FOUND();
      }

      this.logger.log(`Retrieved ${holidays.length} holidays successfully.`);

      return HOLIDAYS_RESPONSES.HOLIDAYS_FETCHED(holidays);
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
        return HOLIDAYS_RESPONSES.HOLIDAY_NOT_FOUND(id);
      }
      this.logger.log(`Holiday with ID ${id} retrieved successfully`);
      return HOLIDAYS_RESPONSES.HOLIDAY_FETCHED(holiday);
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
        return HOLIDAYS_RESPONSES.HOLIDAY_NOT_FOUND(id);
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
        return HOLIDAYS_RESPONSES.USER_NOT_FOUND(updateHolidayDto.updatedBy.id);
      }

      Object.assign(holiday, updateHolidayDto);
      const updatedHoliday = await this.holidayRepository.save(holiday);

      this.logger.log(`Holiday with ID ${id} updated successfully`);

      return HOLIDAYS_RESPONSES.HOLIDAY_UPDATED(updatedHoliday);
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
      const propertySeasonHoliday =
        await this.propertySeasonHolidayRepository.findOne({
          where: { holiday: { id: id } },
        });
      if (propertySeasonHoliday) {
        this.logger.log(
          `Holiday ID ${id} exists and is mapped to property, hence cannot be deleted.`,
        );
        return HOLIDAYS_RESPONSES.HOLIDAY_FOREIGN_KEY_CONFLICT(id);
      }

      const result = await this.holidayRepository.delete(id);
      this.logger.error(`Holiday with ID ${id} not found`);
      if (result.affected === 0) {
        return HOLIDAYS_RESPONSES.HOLIDAY_NOT_FOUND(id);
      }
      this.logger.log(`Holiday with ID ${id} deleted successfully`);
      return HOLIDAYS_RESPONSES.HOLIDAY_DELETED(id);
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
