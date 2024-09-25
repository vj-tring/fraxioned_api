import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { HouseCodeCategory } from '../entities/house-code-category.entity';
import { CreateHouseCodeCategoryDto } from '../dto/requests/house-code-category/create-house-code-category.dto';
import { HOUSE_CODE_CATEGORY_RESPONSES } from '../commons/constants/response-constants/house-code-category.constant';

@Injectable()
export class HouseCodeCategoryService {
  constructor(
    @InjectRepository(HouseCodeCategory)
    private readonly houseCodeCategoryRepository: Repository<HouseCodeCategory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // @InjectRepository(SpaceTypes)
    // private readonly spaceTypesRepository: Repository<SpaceTypes>,
    private readonly logger: LoggerService,
  ) {}

  async createHouseCodeCategory(
    createHouseCodeCategoryDto: CreateHouseCodeCategoryDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: HouseCodeCategory;
    statusCode: number;
  }> {
    try {
      const existingHouseCodeCategory =
        await this.houseCodeCategoryRepository.findOne({
          where: {
            name: createHouseCodeCategoryDto.name,
          },
        });
      if (existingHouseCodeCategory) {
        this.logger.error(
          `Error creating house code category: House code category ${createHouseCodeCategoryDto.name} already exists`,
        );
        return HOUSE_CODE_CATEGORY_RESPONSES.HOUSE_CODE_CATEGORY_ALREADY_EXISTS(
          createHouseCodeCategoryDto.name,
        );
      }

      const user = await this.userRepository.findOne({
        where: {
          id: createHouseCodeCategoryDto.createdBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${createHouseCodeCategoryDto.createdBy.id} does not exist`,
        );
        return HOUSE_CODE_CATEGORY_RESPONSES.USER_NOT_FOUND(
          createHouseCodeCategoryDto.createdBy.id,
        );
      }

      const newCategory = this.houseCodeCategoryRepository.create(
        createHouseCodeCategoryDto,
      );
      const savedCategory =
        await this.houseCodeCategoryRepository.save(newCategory);
      this.logger.log(
        `House code category ${createHouseCodeCategoryDto.name} created with ID ${savedCategory.id}`,
      );
      return HOUSE_CODE_CATEGORY_RESPONSES.HOUSE_CODE_CATEGORY_CREATED(
        savedCategory,
      );
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the House Code Category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllHouseCodeCategories(): Promise<{
    success: boolean;
    message: string;
    data?: HouseCodeCategory[];
    statusCode: number;
  }> {
    try {
      const houseCodeCategories = await this.houseCodeCategoryRepository.find({
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

      if (houseCodeCategories.length === 0) {
        this.logger.log(`No house code categories are available`);
        return HOUSE_CODE_CATEGORY_RESPONSES.HOUSE_CODE_CATEGORIES_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${houseCodeCategories.length} house code categories successfully.`,
      );
      return HOUSE_CODE_CATEGORY_RESPONSES.HOUSE_CODE_CATEGORIES_FETCHED(
        houseCodeCategories,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving house code categories: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all House Code Categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findHouseCodeCategoryById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: HouseCodeCategory;
    statusCode: number;
  }> {
    try {
      const houseCodeCategory = await this.houseCodeCategoryRepository.findOne({
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

      if (!houseCodeCategory) {
        this.logger.error(`House code category with ID ${id} not found`);
        return HOUSE_CODE_CATEGORY_RESPONSES.HOUSE_CODE_CATEGORY_NOT_FOUND(id);
      }

      this.logger.log(
        `House code category with ID ${id} retrieved successfully`,
      );
      return HOUSE_CODE_CATEGORY_RESPONSES.HOUSE_CODE_CATEGORY_FETCHED(
        houseCodeCategory,
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving house code category with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the House Code Category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteHouseCodeCategoryById(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      // const spaceType = await this.spaceTypesRepository.findOne({
      //   where: { space: { id: id } },
      // });
      // if (spaceType) {
      //   this.logger.log(
      //     `Space ID ${id} exists and is mapped to space type, hence cannot be deleted.`,
      //   );
      //   return SPACE_RESPONSES.SPACE_FOREIGN_KEY_CONFLICT(id);
      // }
      const result = await this.houseCodeCategoryRepository.delete(id);
      if (result.affected === 0) {
        this.logger.error(`House code category with ID ${id} not found`);
        return HOUSE_CODE_CATEGORY_RESPONSES.HOUSE_CODE_CATEGORY_NOT_FOUND(id);
      }
      this.logger.log(`House code category with ID ${id} deleted successfully`);
      return HOUSE_CODE_CATEGORY_RESPONSES.HOUSE_CODE_CATEGORY_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting house code category with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the House Code Category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
