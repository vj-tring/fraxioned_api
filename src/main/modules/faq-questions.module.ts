import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from './authentication.module';
import { FaqQuestions } from '../entities/faq-questions.entity';
import { FaqCategoryModule } from './faq-category.module';
import { FaqQuestionsService } from '../service/faq-questions.service';
import { FaqQuestionsController } from '../controller/faq-questions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FaqQuestions]),
    FaqCategoryModule,
    AuthenticationModule,
  ],
  controllers: [FaqQuestionsController],
  providers: [FaqQuestionsService],
})
export class FaqQuestionsModule {}
