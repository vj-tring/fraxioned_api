import { HttpStatus } from '@nestjs/common';
import { HouseCodeCategory } from 'src/main/entities/house-code-category.entity';

export const HOUSE_CODE_CATEGORY_RESPONSES = {
  HOUSE_CODE_CATEGORY_ALREADY_EXISTS: (
    houseCodeCategoryName: string,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `House code category ${houseCodeCategoryName} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),
  USER_NOT_FOUND: (
    createdBy: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `User with ID ${createdBy} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  HOUSE_CODE_CATEGORY_CREATED: (
    savedHouseCodeCategory: HouseCodeCategory,
  ): {
    success: boolean;
    message: string;
    data: HouseCodeCategory;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `House code category ${savedHouseCodeCategory.name} created with ID ${savedHouseCodeCategory.id}`,
    data: savedHouseCodeCategory,
    statusCode: HttpStatus.CREATED,
  }),
  HOUSE_CODE_CATEGORIES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: HouseCodeCategory[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No house code categories are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  HOUSE_CODE_CATEGORIES_FETCHED: (
    houseCodeCategories: HouseCodeCategory[],
  ): {
    success: boolean;
    message: string;
    data?: HouseCodeCategory[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${houseCodeCategories.length} house code categories successfully.`,
    data: houseCodeCategories,
    statusCode: HttpStatus.OK,
  }),
  HOUSE_CODE_CATEGORY_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: HouseCodeCategory;
    statusCode: number;
  } => ({
    success: false,
    message: `House code category with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  HOUSE_CODE_CATEGORY_FETCHED: (
    houseCodeCategory: HouseCodeCategory,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: HouseCodeCategory;
    statusCode: number;
  } => ({
    success: true,
    message: `House code category with ID ${id} retrieved successfully`,
    data: houseCodeCategory,
    statusCode: HttpStatus.OK,
  }),
  //   SPACE_FOREIGN_KEY_CONFLICT: (
  //     id: number,
  //   ): {
  //     success: boolean;
  //     message: string;
  //     statusCode: number;
  //   } => ({
  //     success: false,
  //     message: `Space ID ${id} exists and is mapped to space type, hence cannot be deleted.`,
  //     statusCode: HttpStatus.CONFLICT,
  //   }),
  HOUSE_CODE_CATEGORY_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `House code category with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
};
