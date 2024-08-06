import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePropertySeasonHolidayDto } from '../dto/requests/create-property-season-holiday.dto';
import { PropertySeasonHolidays } from '../entities/property-season-holidays.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoggerService } from './logger.service';
import { Holidays } from '../entities/holidays.entity';
import { Properties } from '../entities/properties.entity';
import { PROPERTY_SEASON_HOLIDAY_RESPONSES } from '../commons/constants/response-constants/property-season-holidays.constants';
import { UpdatePropertySeasonHolidayDto } from '../dto/requests/update-property-season-holiday.dto';

@Injectable()
export class PropertySeasonHolidaysService {
  constructor(
    @InjectRepository(PropertySeasonHolidays)
    private readonly propertySeasonHolidayRepository: Repository<PropertySeasonHolidays>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Holidays)
    private readonly holidayRepository: Repository<Holidays>,
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    private readonly logger: LoggerService,
  ) {}

  async createPropertySeasonHoliday(
    createPropertySeasonHolidayDto: CreatePropertySeasonHolidayDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySeasonHolidays;
    statusCode: number;
  }> {
    try {
      this.logger.log(
        `Creating mapping for property ${createPropertySeasonHolidayDto.property.id} to the holiday ${createPropertySeasonHolidayDto.holiday.id}`,
      );

      const existingProperty = await this.propertiesRepository.findOne({
        where: {
          id: createPropertySeasonHolidayDto.property.id,
        },
      });
      if (!existingProperty) {
        this.logger.error(
          `Property with ID ${createPropertySeasonHolidayDto.property.id} does not exist`,
        );
        return PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_NOT_FOUND(
          createPropertySeasonHolidayDto.property.id,
        );
      }

      const existingHoliday = await this.holidayRepository.findOne({
        where: {
          id: createPropertySeasonHolidayDto.holiday.id,
        },
      });
      if (!existingHoliday) {
        this.logger.error(
          `Holiday with ID ${createPropertySeasonHolidayDto.holiday.id} does not exist`,
        );
        return PROPERTY_SEASON_HOLIDAY_RESPONSES.HOLIDAY_NOT_FOUND(
          createPropertySeasonHolidayDto.holiday.id,
        );
      }

      const user = await this.usersRepository.findOne({
        where: {
          id: createPropertySeasonHolidayDto.createdBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${createPropertySeasonHolidayDto.createdBy.id} does not exist`,
        );
        return PROPERTY_SEASON_HOLIDAY_RESPONSES.USER_NOT_FOUND(
          createPropertySeasonHolidayDto.createdBy.id,
        );
      }

      const existingPropertySeasonHoliday =
        await this.propertySeasonHolidayRepository.findOne({
          where: {
            property: {
              id: createPropertySeasonHolidayDto.property.id,
            },
            holiday: {
              id: createPropertySeasonHolidayDto.holiday.id,
            },
          },
        });

      if (existingPropertySeasonHoliday) {
        this.logger.error(
          `Error creating property Season Holiday: Property ID ${createPropertySeasonHolidayDto.property.id} with Holiday ID ${createPropertySeasonHolidayDto.holiday.id} already exists`,
        );
        return PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_ALREADY_EXISTS(
          createPropertySeasonHolidayDto.property.id,
          createPropertySeasonHolidayDto.holiday.id,
        );
      }

      const propertySeasonHoliday = this.propertySeasonHolidayRepository.create(
        {
          ...createPropertySeasonHolidayDto,
        },
      );
      const savedPropertySeasonHoliday =
        await this.propertySeasonHolidayRepository.save(propertySeasonHoliday);
      this.logger.log(
        `Property Season Holiday with property ID ${createPropertySeasonHolidayDto.property.id} and holiday ID ${createPropertySeasonHolidayDto.holiday.id} created successfully`,
      );
      return PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_CREATED(
        savedPropertySeasonHoliday,
      );
    } catch (error) {
      this.logger.error(
        `Error creating property season holiday: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the property season holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllPropertySeasonHolidays(): Promise<{
    success: boolean;
    message: string;
    data?: PropertySeasonHolidays[];
    statusCode: number;
  }> {
    try {
      const propertySeasonHolidays =
        await this.propertySeasonHolidayRepository.find({
          relations: ['property', 'holiday', 'createdBy', 'updatedBy'],
          select: {
            property: {
              id: true,
            },
            holiday: {
              id: true,
            },
            createdBy: {
              id: true,
            },
            updatedBy: {
              id: true,
            },
          },
        });

      if (propertySeasonHolidays.length === 0) {
        this.logger.log(`No property season holidays are available`);

        return PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAYS_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${propertySeasonHolidays.length} holidays successfully.`,
      );

      return PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAYS_FETCHED(
        propertySeasonHolidays,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property season holidays: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the property season holidays',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPropertySeasonHolidayById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertySeasonHolidays;
    statusCode: number;
  }> {
    try {
      const propertySeasonHoliday =
        await this.propertySeasonHolidayRepository.findOne({
          relations: ['property', 'holiday', 'createdBy', 'updatedBy'],
          select: {
            property: {
              id: true,
            },
            holiday: {
              id: true,
            },
            createdBy: {
              id: true,
            },
            updatedBy: {
              id: true,
            },
          },
          where: { id },
        });

      if (!propertySeasonHoliday) {
        this.logger.error(`Property Season Holiday with ID ${id} not found`);
        return PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_NOT_FOUND(
          id,
        );
      }
      this.logger.log(
        `Property Season Holiday with ID ${id} retrieved successfully`,
      );
      return PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_FETCHED(
        propertySeasonHoliday,
        id,
      );
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

  async updatePropertySeasonHoliday(
    id: number,
    updatePropertySeasonHolidayDto: UpdatePropertySeasonHolidayDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySeasonHolidays;
    statusCode: number;
  }> {
    try {
      const propertySeasonHoliday =
        await this.propertySeasonHolidayRepository.findOne({
          relations: ['property', 'holiday', 'createdBy', 'updatedBy'],
          select: {
            property: {
              id: true,
            },
            holiday: {
              id: true,
            },
            createdBy: {
              id: true,
            },
            updatedBy: {
              id: true,
            },
          },
          where: { id },
        });

      if (!propertySeasonHoliday) {
        this.logger.error(
          `Property Season Holiday with ID ${id} does not exist`,
        );
        return PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_NOT_FOUND(
          id,
        );
      }

      const user = await this.usersRepository.findOne({
        where: {
          id: updatePropertySeasonHolidayDto.updatedBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${updatePropertySeasonHolidayDto.updatedBy.id} does not exist`,
        );
        return PROPERTY_SEASON_HOLIDAY_RESPONSES.USER_NOT_FOUND(
          updatePropertySeasonHolidayDto.updatedBy.id,
        );
      }

      if (
        updatePropertySeasonHolidayDto.property &&
        updatePropertySeasonHolidayDto.property.id
      ) {
        const property = await this.propertiesRepository.findOne({
          where: { id: updatePropertySeasonHolidayDto.property.id },
        });
        if (!property) {
          this.logger.error(
            `Property with ID ${updatePropertySeasonHolidayDto.property.id} does not exist`,
          );
          return PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_NOT_FOUND(
            updatePropertySeasonHolidayDto.property.id,
          );
        }
      }

      if (
        updatePropertySeasonHolidayDto.holiday &&
        updatePropertySeasonHolidayDto.holiday.id
      ) {
        const holiday = await this.holidayRepository.findOne({
          where: { id: updatePropertySeasonHolidayDto.holiday.id },
        });
        if (!holiday) {
          this.logger.error(
            `Holiday with ID ${updatePropertySeasonHolidayDto.holiday.id} does not exist`,
          );
          return PROPERTY_SEASON_HOLIDAY_RESPONSES.HOLIDAY_NOT_FOUND(
            updatePropertySeasonHolidayDto.holiday.id,
          );
        }
      }

      Object.assign(propertySeasonHoliday, updatePropertySeasonHolidayDto);
      const updatedPropertySeasonHoliday =
        await this.propertySeasonHolidayRepository.save(propertySeasonHoliday);

      this.logger.log(
        `Property Season Holiday with ID ${id} updated successfully`,
      );

      return PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_UPDATED(
        updatedPropertySeasonHoliday,
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error updating property season holiday with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the property season holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removePropertySeasonHoliday(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const result = await this.propertySeasonHolidayRepository.delete(id);

      if (result.affected === 0) {
        this.logger.error(`Property Season Holiday with ID ${id} not found`);
        return PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_NOT_FOUND(
          id,
        );
      }
      this.logger.log(
        `Property Season Holiday with ID ${id} deleted successfully`,
      );
      return PROPERTY_SEASON_HOLIDAY_RESPONSES.PROPERTY_SEASON_HOLIDAY_DELETED(
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error deleting property season holiday with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property season holiday',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
