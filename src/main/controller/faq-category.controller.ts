import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { FaqCategoryService } from '../service/faq-category.service';
import { CreateFaqCategoryDto } from '../dto/requests/faq-category/create-faq-category.dto';
import { UpdateFaqCategoryDto } from '../dto/requests/faq-category/update-faq-category.dto';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { FaqCategory } from '../entities/faq_category.entity';

@ApiTags('FAQ Categories')
@Controller('v1/faq-categories')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class FaqCategoryController {
  constructor(private readonly faqCategoryService: FaqCategoryService) {}

  @Post('category')
  async createFaqCategory(
    @Body() createFaqCategoryDto: CreateFaqCategoryDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: FaqCategory;
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.faqCategoryService.createFaqCategory(createFaqCategoryDto);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the FAQ category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllFaqCategories(): Promise<{
    success: boolean;
    message: string;
    data?: FaqCategory[];
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.faqCategoryService.findAllFaqCategories();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving FAQ categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('category/:id')
  async getFaqCategoryById(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: FaqCategory;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.faqCategoryService.findFaqCategoryById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the FAQ category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('category/:id')
  async updateFaqCategory(
    @Param('id') id: number,
    @Body() updateFaqCategoryDto: UpdateFaqCategoryDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: FaqCategory;
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.faqCategoryService.updateFaqCategoryById(
        id,
        updateFaqCategoryDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the FAQ category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('category/:id')
  async deleteFaqCategory(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result = await this.faqCategoryService.deleteFaqCategoryById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the FAQ category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
