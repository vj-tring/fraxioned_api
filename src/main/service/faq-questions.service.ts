import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqQuestions } from '../entities/faq_questions.entity';
import { CreateFaqQuestionsDto } from '../dto/requests/faq-questions/create-faq-questions.dto';
import { UpdateFaqQuestionsDto } from '../dto/requests/faq-questions/update-faq-questions.dto';
import { FaqCategoryService } from './faq-category.service';
import { FAQ_QUESTIONS_RESPONSES } from '../commons/constants/response-constants/faq_questions_constant';

@Injectable()
export class FaqQuestionsService {
  constructor(
    @InjectRepository(FaqQuestions)
    private readonly faqQuestionsRepository: Repository<FaqQuestions>,
    private readonly faqCategoryService: FaqCategoryService,
  ) {}

  async createFaqQuestion(
    createFaqQuestionsDto: CreateFaqQuestionsDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: FaqQuestions;
    statusCode: HttpStatus;
  }> {
    const { categoryId, question } = createFaqQuestionsDto;

    await this.faqCategoryService.findFaqCategoryById(categoryId);

    const newQuestion = this.faqQuestionsRepository.create(
      createFaqQuestionsDto,
    );
    const savedQuestion = await this.faqQuestionsRepository.save(newQuestion);
    return FAQ_QUESTIONS_RESPONSES.QUESTION_CREATED(savedQuestion, question);
  }

  async findAllFaqQuestions(): Promise<{
    success: boolean;
    message: string;
    data?: FaqQuestions[];
    statusCode: HttpStatus;
  }> {
    const questions = await this.faqQuestionsRepository.find();
    if (!questions || questions.length === 0) {
      return FAQ_QUESTIONS_RESPONSES.QUESTIONS_NOT_FOUND();
    }
    return FAQ_QUESTIONS_RESPONSES.QUESTIONS_FETCHED(questions);
  }

  async findFaqQuestionById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: FaqQuestions;
    statusCode: HttpStatus;
  }> {
    const question = await this.faqQuestionsRepository.findOne({
      where: { id },
    }); // Updated here
    if (!question) {
      throw new HttpException(
        FAQ_QUESTIONS_RESPONSES.QUESTION_NOT_FOUND(id),
        HttpStatus.NOT_FOUND,
      );
    }
    return FAQ_QUESTIONS_RESPONSES.QUESTION_FETCHED(question);
  }

  async updateFaqQuestionById(
    id: number,
    updateFaqQuestionsDto: UpdateFaqQuestionsDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: FaqQuestions;
    statusCode: HttpStatus;
  }> {
    const question = await this.faqQuestionsRepository.findOne({
      where: { id },
    });
    if (!question) {
      throw new HttpException(
        FAQ_QUESTIONS_RESPONSES.QUESTION_NOT_FOUND(id),
        HttpStatus.NOT_FOUND,
      );
    }

    if (updateFaqQuestionsDto.categoryId) {
      await this.faqCategoryService.findFaqCategoryById(
        updateFaqQuestionsDto.categoryId,
      );
    }

    Object.assign(question, updateFaqQuestionsDto);
    const updatedQuestion = await this.faqQuestionsRepository.save(question);

    return FAQ_QUESTIONS_RESPONSES.QUESTION_UPDATED(updatedQuestion);
  }

  async deleteFaqQuestionById(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: HttpStatus;
  }> {
    const question = await this.faqQuestionsRepository.findOne({
      where: { id },
    });
    if (!question) {
      throw new HttpException(
        FAQ_QUESTIONS_RESPONSES.QUESTION_NOT_FOUND(id),
        HttpStatus.NOT_FOUND,
      );
    }

    await this.faqQuestionsRepository.delete(id);
    return FAQ_QUESTIONS_RESPONSES.QUESTION_DELETED(id);
  }
}
