import { HttpStatus } from '@nestjs/common';
import { PropertyCodeCategory } from 'src/main/entities/property-code-category.entity';

export const PROPERTY_CODE_CATEGORY_RESPONSES = {
  PROPERTY_CODE_CATEGORY_ALREADY_EXISTS: (
    propertyCodeCategoryName: string,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Property code category ${propertyCodeCategoryName} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),
  USER_NOT_FOUND: (
    createdBy: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `User with ID ${createdBy} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_CODE_CATEGORY_CREATED: (
    savedPropertyCodeCategory: PropertyCodeCategory,
  ): {
    success: boolean;
    message: string;
    data: PropertyCodeCategory;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Property code category ${savedPropertyCodeCategory.name} created with ID ${savedPropertyCodeCategory.id}`,
    data: savedPropertyCodeCategory,
    statusCode: HttpStatus.CREATED,
  }),
  PROPERTY_CODE_CATEGORIES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: PropertyCodeCategory[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No property code categories are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_CODE_CATEGORIES_FETCHED: (
    propertyCodeCategories: PropertyCodeCategory[],
  ): {
    success: boolean;
    message: string;
    data?: PropertyCodeCategory[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${propertyCodeCategories.length} property code categories successfully.`,
    data: propertyCodeCategories,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_CODE_CATEGORY_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertyCodeCategory;
    statusCode: number;
  } => ({
    success: false,
    message: `Property code category with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_CODE_CATEGORY_FETCHED: (
    propertyCodeCategory: PropertyCodeCategory,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertyCodeCategory;
    statusCode: number;
  } => ({
    success: true,
    message: `Property code category with ID ${id} retrieved successfully`,
    data: propertyCodeCategory,
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
  PROPERTY_CODE_CATEGORY_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Property code category with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
};
