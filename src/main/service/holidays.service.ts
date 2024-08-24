import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateHolidayDto } from '../dto/requests/holiday/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/requests/holiday/update-holiday.dto';
import { Holidays } from '../entities/holidays.entity';
import { User } from '../entities/user.entity';
import { HOLIDAYS_RESPONSES } from '../commons/constants/response-constants/holiday.constants';
import { PropertySeasonHolidays } from '../entities/property-season-holidays.entity';
import { CreatePropertySeasonHolidayDto } from '../dto/requests/property-season-holiday/create-property-season-holiday.dto';
import { PropertySeasonHolidaysService } from './property-season-holidays.service';
import { PropertyDetails } from '../entities/property-details.entity';
import { Property } from '../entities/property.entity';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holidays)
    private readonly holidayRepository: Repository<Holidays>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(PropertySeasonHolidays)
    private readonly propertySeasonHolidayRepository: Repository<PropertySeasonHolidays>,
    @InjectRepository(PropertyDetails)
    private readonly propertyDetailsRepository: Repository<PropertyDetails>,
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
    private readonly propertySeasonHolidayService: PropertySeasonHolidaysService,
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

      const propertyIds = createHolidayDto.properties.map(
        (property) => property.id,
      );
      const existingProperties = await this.propertiesRepository.findBy({
        id: In(propertyIds),
      });

      if (propertyIds.length > 0) {
        const nonExistingIds = propertyIds.filter(
          (id) => !existingProperties.some((property) => property.id === id),
        );
        if (nonExistingIds.length > 0) {
          this.logger.error(
            `Properties with ID(s) ${nonExistingIds.join(', ')} do not exist`,
          );
          return HOLIDAYS_RESPONSES.PROPERTIES_NOT_FOUND(nonExistingIds);
        }
      }

      const holiday = this.holidayRepository.create({
        ...createHolidayDto,
      });
      const savedHoliday = await this.holidayRepository.save(holiday);
      this.logger.log(
        `Holiday ${createHolidayDto.name} created with ID ${savedHoliday.id}`,
      );

      if (
        savedHoliday &&
        createHolidayDto.properties &&
        createHolidayDto.properties.length > 0
      ) {
        for (const property of createHolidayDto.properties) {
          const propertyDetails = await this.propertyDetailsRepository.findOne({
            where: { property: { id: property.id } },
          });

          if (!propertyDetails) {
            this.logger.error(
              `Property details not found for property with ID ${property.id}`,
            );
            return HOLIDAYS_RESPONSES.PROPERTY_DETAILS_NOT_FOUND(property.id);
          }

          const isPeakSeason = await this.isHolidayInPeakSeason(
            createHolidayDto.startDate,
            createHolidayDto.endDate,
            propertyDetails,
          );

          const createPropertySeasonHolidayDto: CreatePropertySeasonHolidayDto =
            {
              property: property,
              holiday: { id: savedHoliday.id } as Holidays,
              isPeakSeason: isPeakSeason,
              createdBy: createHolidayDto.createdBy,
            };

          await this.propertySeasonHolidayService.createPropertySeasonHoliday(
            createPropertySeasonHolidayDto,
          );
        }
      }
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

  async isHolidayInPeakSeason(
    holidayStartDate: Date,
    holidayEndDate: Date,
    propertyDetails: PropertyDetails,
  ): Promise<boolean> {
    try {
      let { peakSeasonStartDate, peakSeasonEndDate } = propertyDetails;

      const startHolidayDate = new Date(holidayStartDate);
      const endHolidayDate = new Date(holidayEndDate);
      peakSeasonStartDate = new Date(peakSeasonStartDate);
      peakSeasonEndDate = new Date(peakSeasonEndDate);

      const isDateWithinPeakSeason = (
        date: Date,
        peakStart: Date,
        peakEnd: Date,
      ): boolean => {
        const dateMonth = date.getMonth() + 1;
        const dateDay = date.getDate();

        const peakStartMonth = peakStart.getMonth() + 1;
        const peakStartDay = peakStart.getDate();

        const peakEndMonth = peakEnd.getMonth() + 1;
        const peakEndDay = peakEnd.getDate();

        const isAfterOrOnPeakStart =
          dateMonth > peakStartMonth ||
          (dateMonth === peakStartMonth && dateDay >= peakStartDay);

        const isBeforeOrOnPeakEnd =
          dateMonth < peakEndMonth ||
          (dateMonth === peakEndMonth && dateDay <= peakEndDay);

        return isAfterOrOnPeakStart && isBeforeOrOnPeakEnd;
      };

      return (
        isDateWithinPeakSeason(
          startHolidayDate,
          peakSeasonStartDate,
          peakSeasonEndDate,
        ) &&
        isDateWithinPeakSeason(
          endHolidayDate,
          peakSeasonStartDate,
          peakSeasonEndDate,
        )
      );
    } catch (error) {
      this.logger.error(
        `Error calculation is peak season or not: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while calculation is peak season or not',
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
      const holidays = await this.holidayRepository.find({
        relations: ['createdBy', 'updatedBy'],
        select: {
          createdBy: {
            id: true,
          },
          updatedBy: {
            id: true,
          },
        },
      });

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
        relations: [
          'createdBy',
          'updatedBy',
          'propertySeasonHolidays',
          'propertySeasonHolidays.property',
        ],
        select: {
          createdBy: {
            id: true,
          },
          updatedBy: {
            id: true,
          },
          propertySeasonHolidays: {
            id: true,
            property: {
              id: true,
              propertyName: true,
            },
          },
        },
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
        relations: ['createdBy', 'updatedBy'],
        select: {
          createdBy: {
            id: true,
          },
          updatedBy: {
            id: true,
          },
        },
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

      if (updateHolidayDto.properties) {
        const propertyIds = updateHolidayDto.properties.map(
          (property) => property.id,
        );
        const existingProperties = await this.propertiesRepository.findBy({
          id: In(propertyIds),
        });

        if (propertyIds.length > 0) {
          const nonExistingIds = propertyIds.filter(
            (id) => !existingProperties.some((property) => property.id === id),
          );
          if (nonExistingIds.length > 0) {
            this.logger.error(
              `Properties with ID(s) ${nonExistingIds.join(', ')} do not exist`,
            );
            return HOLIDAYS_RESPONSES.PROPERTIES_NOT_FOUND(nonExistingIds);
          }
        }
      }

      Object.assign(holiday, updateHolidayDto);
      const updatedHoliday = await this.holidayRepository.save(holiday);

      this.logger.log(`Holiday with ID ${id} updated successfully`);

      if (updatedHoliday && updateHolidayDto.properties) {
        const { properties } = updateHolidayDto;
        const holiday = await this.holidayRepository.findOne({
          where: { id },
          relations: [
            'propertySeasonHolidays',
            'propertySeasonHolidays.property',
            'propertySeasonHolidays.holiday',
          ],
        });
        if (!holiday) {
          this.logger.error(`Holiday with ID ${id} not found`);
          return HOLIDAYS_RESPONSES.HOLIDAY_NOT_FOUND(id);
        }
        const existingPropertySeasonHolidays = holiday.propertySeasonHolidays;
        const propertyIdsFromDto = properties.map((property) => property.id);
        const existingPropertyIds = existingPropertySeasonHolidays.map(
          (psh) => psh.property.id,
        );

        const recordsToDelete = existingPropertySeasonHolidays.filter(
          (psh) => !propertyIdsFromDto.includes(psh.property.id),
        );

        const recordsToCreate = propertyIdsFromDto.filter(
          (propertyId) => !existingPropertyIds.includes(propertyId),
        );

        const idsToDelete = recordsToDelete.map((record) => record.id);
        if (idsToDelete.length > 0) {
          await this.propertySeasonHolidayRepository.delete(idsToDelete);
        }

        if (recordsToCreate.length > 0) {
          for (const property of updateHolidayDto.properties) {
            const propertyDetails =
              await this.propertyDetailsRepository.findOne({
                where: { property: { id: property.id } },
              });

            if (!propertyDetails) {
              this.logger.error(
                `Property details not found for property with ID ${property.id}`,
              );
              return HOLIDAYS_RESPONSES.PROPERTY_DETAILS_NOT_FOUND(property.id);
            }

            const startDate = updateHolidayDto.startDate || holiday.startDate;
            const endDate = updateHolidayDto.endDate || holiday.endDate;

            const isPeakSeason = await this.isHolidayInPeakSeason(
              startDate,
              endDate,
              propertyDetails,
            );

            const createPropertySeasonHolidayDto: CreatePropertySeasonHolidayDto =
              {
                property: property,
                holiday: { id: updatedHoliday.id } as Holidays,
                isPeakSeason: isPeakSeason,
                createdBy: updateHolidayDto.updatedBy,
              };

            await this.propertySeasonHolidayService.createPropertySeasonHoliday(
              createPropertySeasonHolidayDto,
            );
          }
        }
      }

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

      if (result.affected === 0) {
        this.logger.error(`Holiday with ID ${id} not found`);
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
