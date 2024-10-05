import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePropertyCodeDto } from '../dto/requests/property-code/create-property-code.dto';
import { UpdatePropertyCodeDto } from '../dto/requests/property-code/update-property-code.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from './logger.service';
import { PropertyCodes } from '../entities/property-codes.entity';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';
import { PropertyCodeCategory } from '../entities/property-code-category.entity';
import { PROPERTY_CODES_RESPONSES } from '../commons/constants/response-constants/property-codes.constant';
import { User } from '../entities/user.entity';
import { PropertyCodeCategoryService } from './property-code-category.service';

@Injectable()
export class PropertyCodesService {
  constructor(
    @InjectRepository(PropertyCodes)
    private propertyCodesRepository: Repository<PropertyCodes>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PropertyCodeCategory)
    private propertyCodeCategoryRepository: Repository<PropertyCodeCategory>,
    private readonly propertyCodeCategoryService: PropertyCodeCategoryService,
    private readonly logger: LoggerService,
  ) {}

  async createPropertyCodes(
    createPropertyCodeDto: CreatePropertyCodeDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyCodes;
    statusCode: HttpStatus;
  }> {
    try {
      const existingProperty = await this.propertyRepository.findOne({
        where: {
          id: createPropertyCodeDto.property.id,
        },
      });
      if (!existingProperty) {
        this.logger.error(
          `Property with ID ${createPropertyCodeDto.property.id} does not exist`,
        );
        return PROPERTY_CODES_RESPONSES.PROPERTY_NOT_FOUND(
          createPropertyCodeDto.property.id,
        );
      }

      const user = await this.userRepository.findOne({
        where: {
          id: createPropertyCodeDto.createdBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${createPropertyCodeDto.createdBy.id} does not exist`,
        );
        return PROPERTY_CODES_RESPONSES.USER_NOT_FOUND(
          createPropertyCodeDto.createdBy.id,
        );
      }

      const existingPropertyCodeCategory =
        await this.propertyCodeCategoryRepository.findOne({
          where: {
            id: createPropertyCodeDto.propertyCodeCategory.id,
          },
        });
      if (!existingPropertyCodeCategory) {
        this.logger.error(
          `Property Code Category with ID ${createPropertyCodeDto.propertyCodeCategory.id} does not exist`,
        );
        return PROPERTY_CODES_RESPONSES.PROPERTY_CODE_CATEGORY_NOT_FOUND(
          createPropertyCodeDto.propertyCodeCategory.id,
        );
      }

      if (
        existingPropertyCodeCategory &&
        existingPropertyCodeCategory.name.toLowerCase() === 'other'
      ) {
        const existingPropertyCodeCategoryName =
          await this.propertyCodeCategoryRepository.findOne({
            where: {
              name: createPropertyCodeDto.propertyCodeCategory.name,
            },
          });
        if (existingPropertyCodeCategoryName) {
          return PROPERTY_CODES_RESPONSES.PROPERTY_CODE_CATEGORY_ALREADY_EXISTS(
            createPropertyCodeDto.propertyCodeCategory.name,
          );
        } else {
          const categoryResponse =
            await this.propertyCodeCategoryService.createPropertyCodeCategory({
              createdBy: { id: createPropertyCodeDto.createdBy.id } as User,
              name: createPropertyCodeDto.propertyCodeCategory.name,
            });

          createPropertyCodeDto.propertyCodeCategory.id =
            categoryResponse.data.id;
        }
      }

      const propertyCodes = this.propertyCodesRepository.create({
        ...createPropertyCodeDto,
      });
      const savedPropertyCodes =
        await this.propertyCodesRepository.save(propertyCodes);
      this.logger.log(
        `Property Code ${createPropertyCodeDto.propertyCode} for category ${createPropertyCodeDto.propertyCodeCategory.name} created successfully`,
      );
      return PROPERTY_CODES_RESPONSES.PROPERTY_CODE_CREATED(savedPropertyCodes);
    } catch (error) {
      this.logger.error(
        `Error creating property code: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the property code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllPropertyCodes(): Promise<{
    success: boolean;
    message: string;
    data?: PropertyCodes[];
    statusCode: number;
  }> {
    try {
      const propertyCodes = await this.propertyCodesRepository.find({
        relations: [
          'property',
          'propertyCodeCategory',
          'createdBy',
          'updatedBy',
        ],
        select: {
          property: {
            id: true,
            propertyName: true,
          },
          propertyCodeCategory: {
            id: true,
            name: true,
          },
          createdBy: {
            id: true,
          },
          updatedBy: {
            id: true,
          },
        },
      });

      if (propertyCodes.length === 0) {
        this.logger.log(`No property codes are available`);

        return PROPERTY_CODES_RESPONSES.PROPERTY_CODES_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${propertyCodes.length} property codes successfully.`,
      );

      return PROPERTY_CODES_RESPONSES.PROPERTY_CODES_FETCHED(propertyCodes);
    } catch (error) {
      this.logger.error(
        `Error retrieving property codes: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all the property codes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPropertyCodeById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertyCodes;
    statusCode: number;
  }> {
    try {
      const propertyCode = await this.propertyCodesRepository.findOne({
        relations: [
          'property',
          'propertyCodeCategory',
          'createdBy',
          'updatedBy',
        ],
        select: {
          property: {
            id: true,
            propertyName: true,
          },
          propertyCodeCategory: {
            id: true,
            name: true,
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

      if (!propertyCode) {
        this.logger.error(`Property code with ID ${id} not found`);
        return PROPERTY_CODES_RESPONSES.PROPERTY_CODE_NOT_FOUND(id);
      }
      this.logger.log(`Property code with ID ${id} retrieved successfully`);
      return PROPERTY_CODES_RESPONSES.PROPERTY_CODE_FETCHED(propertyCode, id);
    } catch (error) {
      this.logger.error(
        `Error retrieving property code with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the property code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePropertyCodeById(
    id: number,
    updatePropertyCodeDto: UpdatePropertyCodeDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyCodes;
    statusCode: number;
  }> {
    try {
      const propertyCode = await this.propertyCodesRepository.findOne({
        relations: [
          'property',
          'propertyCodeCategory',
          'createdBy',
          'updatedBy',
        ],
        select: {
          property: {
            id: true,
            propertyName: true,
          },
          propertyCodeCategory: {
            id: true,
            name: true,
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

      if (!propertyCode) {
        this.logger.error(`Property code with ID ${id} does not exist`);
        return PROPERTY_CODES_RESPONSES.PROPERTY_CODE_NOT_FOUND(id);
      }

      const existingProperty = await this.propertyRepository.findOne({
        where: {
          id: updatePropertyCodeDto.property.id,
        },
      });
      if (!existingProperty) {
        this.logger.error(
          `Property with ID ${updatePropertyCodeDto.property.id} does not exist`,
        );
        return PROPERTY_CODES_RESPONSES.PROPERTY_NOT_FOUND(
          updatePropertyCodeDto.property.id,
        );
      }

      const user = await this.userRepository.findOne({
        where: {
          id: updatePropertyCodeDto.updatedBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${updatePropertyCodeDto.updatedBy.id} does not exist`,
        );
        return PROPERTY_CODES_RESPONSES.USER_NOT_FOUND(
          updatePropertyCodeDto.updatedBy.id,
        );
      }

      const existingPropertyCodeCategory =
        await this.propertyCodeCategoryRepository.findOne({
          where: {
            id: updatePropertyCodeDto.propertyCodeCategory.id,
          },
        });
      if (!existingPropertyCodeCategory) {
        this.logger.error(
          `Property Code Category with ID ${updatePropertyCodeDto.propertyCodeCategory.id} does not exist`,
        );
        return PROPERTY_CODES_RESPONSES.PROPERTY_CODE_CATEGORY_NOT_FOUND(
          updatePropertyCodeDto.propertyCodeCategory.id,
        );
      }

      Object.assign(propertyCode, updatePropertyCodeDto);
      const updatedPropertyCode =
        await this.propertyCodesRepository.save(propertyCode);

      this.logger.log(`Property code with ID ${id} updated successfully`);

      return PROPERTY_CODES_RESPONSES.PROPERTY_CODE_UPDATED(
        updatedPropertyCode,
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error updating property code with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the property code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removePropertyCode(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const result = await this.propertyCodesRepository.delete(id);

      if (result.affected === 0) {
        this.logger.error(`Property code with ID ${id} not found`);
        return PROPERTY_CODES_RESPONSES.PROPERTY_CODE_NOT_FOUND(id);
      }
      this.logger.log(`Property code with ID ${id} deleted successfully`);
      return PROPERTY_CODES_RESPONSES.PROPERTY_CODE_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting property code with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
