import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqCategory } from '../entities/faq-category.entity';
import { CreateFaqCategoryDto } from '../dto/requests/faq-category/create-faq-category.dto';
import { UpdateFaqCategoryDto } from '../dto/requests/faq-category/update-faq-category.dto';
import { FAQ_CATEGORY_RESPONSES } from '../commons/constants/response-constants/faq-category-constant';

@Injectable()
export class FaqCategoryService {
  constructor(
    @InjectRepository(FaqCategory)
    private readonly faqCategoryRepository: Repository<FaqCategory>,
  ) {}

  async createFaqCategory(createFaqCategoryDto: CreateFaqCategoryDto): Promise<{
    success: boolean;
    message: string;
    data?: FaqCategory;
    statusCode: HttpStatus;
  }> {
    const { categoryName } = createFaqCategoryDto;
    const categoryExists = await this.faqCategoryRepository.findOne({
      where: { categoryName },
    });

    if (categoryExists) {
      throw new HttpException(
        FAQ_CATEGORY_RESPONSES.CATEGORY_ALREADY_EXISTS(categoryName),
        HttpStatus.CONFLICT,
      );
    }

    const newCategory = this.faqCategoryRepository.create(createFaqCategoryDto);
    const savedCategory = await this.faqCategoryRepository.save(newCategory);

    return FAQ_CATEGORY_RESPONSES.CATEGORY_CREATED(savedCategory, categoryName);
  }

  async findAllFaqCategories(): Promise<{
    success: boolean;
    message: string;
    data?: FaqCategory[];
    statusCode: HttpStatus;
  }> {
    const categories = await this.faqCategoryRepository.find();
    if (!categories || categories.length === 0) {
      return FAQ_CATEGORY_RESPONSES.CATEGORIES_NOT_FOUND();
    }
    return FAQ_CATEGORY_RESPONSES.CATEGORIES_FETCHED(categories);
  }

  async findFaqCategoryById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: FaqCategory;
    statusCode: HttpStatus;
  }> {
    const category = await this.faqCategoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new HttpException(
        FAQ_CATEGORY_RESPONSES.CATEGORY_NOT_FOUND(id),
        HttpStatus.NOT_FOUND,
      );
    }
    return FAQ_CATEGORY_RESPONSES.CATEGORY_FETCHED(category);
  }

  async updateFaqCategoryById(
    id: number,
    updateFaqCategoryDto: UpdateFaqCategoryDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: FaqCategory;
    statusCode: HttpStatus;
  }> {
    const category = await this.faqCategoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new HttpException(
        FAQ_CATEGORY_RESPONSES.CATEGORY_NOT_FOUND(id),
        HttpStatus.NOT_FOUND,
      );
    }

    Object.assign(category, updateFaqCategoryDto);
    const updatedCategory = await this.faqCategoryRepository.save(category);

    return FAQ_CATEGORY_RESPONSES.CATEGORY_UPDATED(updatedCategory);
  }

  async deleteFaqCategoryById(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: HttpStatus;
  }> {
    const category = await this.faqCategoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new HttpException(
        FAQ_CATEGORY_RESPONSES.CATEGORY_NOT_FOUND(id),
        HttpStatus.NOT_FOUND,
      );
    }

    await this.faqCategoryRepository.delete(id);
    return FAQ_CATEGORY_RESPONSES.CATEGORY_DELETED(id);
  }
}
