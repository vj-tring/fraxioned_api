import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { PropertyCodeCategory } from '../entities/property-code-category.entity';
import { CreatePropertyCodeCategoryDto } from '../dto/requests/property-code-category/create-property-code-category.dto';
import { PROPERTY_CODE_CATEGORY_RESPONSES } from '../commons/constants/response-constants/property-code-category.constant';
import { PropertyCodes } from '../entities/property_codes.entity';

@Injectable()
export class PropertyCodeCategoryService {
  constructor(
    @InjectRepository(PropertyCodeCategory)
    private readonly propertyCodeCategoryRepository: Repository<PropertyCodeCategory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PropertyCodes)
    private propertyCodesRepository: Repository<PropertyCodes>,
    private readonly logger: LoggerService,
  ) {}

  async createPropertyCodeCategory(
    createPropertyCodeCategoryDto: CreatePropertyCodeCategoryDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyCodeCategory;
    statusCode: number;
  }> {
    try {
      const existingPropertyCodeCategory =
        await this.propertyCodeCategoryRepository.findOne({
          where: {
            name: createPropertyCodeCategoryDto.name,
          },
        });
      if (existingPropertyCodeCategory) {
        this.logger.error(
          `Error creating property code category: Property code category ${createPropertyCodeCategoryDto.name} already exists`,
        );
        return PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_ALREADY_EXISTS(
          createPropertyCodeCategoryDto.name,
        );
      }

      const user = await this.userRepository.findOne({
        where: {
          id: createPropertyCodeCategoryDto.createdBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${createPropertyCodeCategoryDto.createdBy.id} does not exist`,
        );
        return PROPERTY_CODE_CATEGORY_RESPONSES.USER_NOT_FOUND(
          createPropertyCodeCategoryDto.createdBy.id,
        );
      }

      const newCategory = this.propertyCodeCategoryRepository.create(
        createPropertyCodeCategoryDto,
      );
      const savedCategory =
        await this.propertyCodeCategoryRepository.save(newCategory);
      this.logger.log(
        `Property code category ${createPropertyCodeCategoryDto.name} created with ID ${savedCategory.id}`,
      );
      return PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_CREATED(
        savedCategory,
      );
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the Property Code Category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllPropertyCodeCategories(): Promise<{
    success: boolean;
    message: string;
    data?: PropertyCodeCategory[];
    statusCode: number;
  }> {
    try {
      const propertyCodeCategories =
        await this.propertyCodeCategoryRepository.find({
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

      if (propertyCodeCategories.length === 0) {
        this.logger.log(`No property code categories are available`);
        return PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORIES_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${propertyCodeCategories.length} property code categories successfully.`,
      );
      return PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORIES_FETCHED(
        propertyCodeCategories,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property code categories: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all Property Code Categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPropertyCodeCategoryById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertyCodeCategory;
    statusCode: number;
  }> {
    try {
      const propertyCodeCategory =
        await this.propertyCodeCategoryRepository.findOne({
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

      if (!propertyCodeCategory) {
        this.logger.error(`Property code category with ID ${id} not found`);
        return PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_NOT_FOUND(
          id,
        );
      }

      this.logger.log(
        `Property code category with ID ${id} retrieved successfully`,
      );
      return PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_FETCHED(
        propertyCodeCategory,
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property code category with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the Property Code Category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePropertyCodeCategoryById(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const propertyCode = await this.propertyCodesRepository.findOne({
        where: { propertyCodeCategory: { id: id } },
      });
      if (propertyCode) {
        this.logger.log(
          `Property code category ID ${id} exists and is mapped to property code, hence cannot be deleted.`,
        );
        return PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_FOREIGN_KEY_CONFLICT(
          id,
        );
      }
      const result = await this.propertyCodeCategoryRepository.delete(id);
      if (result.affected === 0) {
        this.logger.error(`Property code category with ID ${id} not found`);
        return PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_NOT_FOUND(
          id,
        );
      }
      this.logger.log(
        `Property code category with ID ${id} deleted successfully`,
      );
      return PROPERTY_CODE_CATEGORY_RESPONSES.PROPERTY_CODE_CATEGORY_DELETED(
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error deleting property code category with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the Property Code Category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
