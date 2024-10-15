import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { User } from '../entities/user.entity';
import { PropertyCodeCategory } from '../entities/property-code-category.entity';
import { PropertyCodeCategoryController } from '../controller/property-code-category.controller';
import { PropertyCodeCategoryService } from '../service/property-code-category.service';
import { PropertyCodes } from '../entities/property-codes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyCodeCategory, User, PropertyCodes]),
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [PropertyCodeCategoryController],
  providers: [PropertyCodeCategoryService],
  exports: [PropertyCodeCategoryService],
})
export class PropertyCodeCategoryModule {}
