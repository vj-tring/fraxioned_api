import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { User } from '../entities/user.entity';
import { HouseCodeCategory } from '../entities/house-code-category.entity';
import { HouseCodeCategoryController } from '../controller/house-code-category.controller';
import { HouseCodeCategoryService } from '../service/house-code-category.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HouseCodeCategory, User]),
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [HouseCodeCategoryController],
  providers: [HouseCodeCategoryService],
})
export class HouseCodeCategoryModule {}
