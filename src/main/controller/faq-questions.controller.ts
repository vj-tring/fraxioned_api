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
import { FaqQuestionsService } from '../service/faq-questions.service';
import { CreateFaqQuestionsDto } from '../dto/requests/faq-questions/create-faq-questions.dto';
import { UpdateFaqQuestionsDto } from '../dto/requests/faq-questions/update-faq-questions.dto';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { FaqQuestions } from '../entities/faq-questions.entity';

@ApiTags('FAQ Questions')
@Controller('v1/faq-questions')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class FaqQuestionsController {
  constructor(private readonly faqQuestionsService: FaqQuestionsService) {}

  @Post('question')
  async createFaqQuestion(
    @Body() createFaqQuestionsDto: CreateFaqQuestionsDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: FaqQuestions & { categoryId: number };
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.faqQuestionsService.createFaqQuestion(
        createFaqQuestionsDto,
      );
      return {
        ...result,
        data: {
          ...result.data,
          categoryId: createFaqQuestionsDto.categoryId,
        },
      };
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the FAQ question',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllFaqQuestions(): Promise<{
    success: boolean;
    message: string;
    data?: (FaqQuestions & { categoryId: number })[];
  }> {
    try {
      const result = await this.faqQuestionsService.findAllFaqQuestions();
      return {
        ...result,
        data: result.data?.map((question) => ({
          ...question,
          categoryId: question.category.id,
        })),
      };
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving FAQ questions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('question/:id')
  async getFaqQuestionById(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: FaqQuestions & { categoryId: number };
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.faqQuestionsService.findFaqQuestionById(id);
      return {
        ...result,
        data: {
          ...result.data,
          categoryId: result.data.category.id,
        },
      };
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the FAQ question',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('question/:id')
  async updateFaqQuestion(
    @Param('id') id: number,
    @Body() updateFaqQuestionsDto: UpdateFaqQuestionsDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: FaqQuestions & { categoryId: number };
    statusCode: HttpStatus;
  }> {
    try {
      const result = await this.faqQuestionsService.updateFaqQuestionById(
        id,
        updateFaqQuestionsDto,
      );
      return {
        ...result,
        data: {
          ...result.data,
          categoryId:
            updateFaqQuestionsDto.categoryId || result.data.category.id,
        },
      };
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the FAQ question',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('question/:id')
  async deleteFaqQuestion(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result = await this.faqQuestionsService.deleteFaqQuestionById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the FAQ question',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
