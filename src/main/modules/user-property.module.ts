import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPropertyController } from '../controller/user-property.controller';
import { UserPropertyService } from '../service/user-property.service';
import { UserProperties } from '../entities/user-properties.entity';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProperties]),
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [UserPropertyController],
  providers: [UserPropertyService],
  exports: [UserPropertyService],
})
export class UserPropertyModule {}
