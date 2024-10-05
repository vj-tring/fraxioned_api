import { HttpStatus } from '@nestjs/common';
import { FaqCategory } from 'src/main/entities/faq-category.entity';

export const FAQ_CATEGORY_RESPONSES = {
  CATEGORY_ALREADY_EXISTS: (
    categoryName: string,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Category "${categoryName}" already exists.`,
    statusCode: HttpStatus.CONFLICT,
  }),

  CATEGORY_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Category with ID "${id}" not found.`,
    statusCode: HttpStatus.NOT_FOUND,
  }),

  CATEGORIES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data: FaqCategory[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No categories available.',
    data: [],
    statusCode: HttpStatus.OK,
  }),

  CATEGORY_CREATED: (
    savedCategory: FaqCategory,
    categoryName: string,
  ): {
    success: boolean;
    message: string;
    data: FaqCategory;
    statusCode: number;
  } => ({
    success: true,
    message: `Category "${categoryName}" created successfully.`,
    data: savedCategory,
    statusCode: HttpStatus.CREATED,
  }),

  CATEGORIES_FETCHED: (
    categories: FaqCategory[],
  ): {
    success: boolean;
    message: string;
    data: FaqCategory[];
    statusCode: number;
  } => ({
    success: true,
    message: 'Categories fetched successfully.',
    data: categories,
    statusCode: HttpStatus.OK,
  }),

  CATEGORY_FETCHED: (
    category: FaqCategory,
  ): {
    success: boolean;
    message: string;
    data: FaqCategory;
    statusCode: number;
  } => ({
    success: true,
    message: 'Category fetched successfully.',
    data: category,
    statusCode: HttpStatus.OK,
  }),

  CATEGORY_UPDATED: (
    updatedCategory: FaqCategory,
  ): {
    success: boolean;
    message: string;
    data: FaqCategory;
    statusCode: number;
  } => ({
    success: true,
    message: 'Category updated successfully.',
    data: updatedCategory,
    statusCode: HttpStatus.OK,
  }),

  CATEGORY_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Category with ID "${id}" deleted successfully.`,
    statusCode: HttpStatus.OK,
  }),
};
