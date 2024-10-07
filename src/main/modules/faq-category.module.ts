import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqCategory } from '../entities/faq-category.entity';
import { FaqCategoryService } from '../service/faq-category.service';
import { FaqCategoryController } from '../controller/faq-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FaqCategory]), AuthenticationModule],
  controllers: [FaqCategoryController],
  providers: [FaqCategoryService],
  exports: [FaqCategoryService],
})
export class FaqCategoryModule {}
