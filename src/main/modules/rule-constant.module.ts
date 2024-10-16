import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { UserModule } from './user.module';
import { RuleConstant } from '../entities/rule-constant.entity';
import { RuleConstantController } from '../controller/rule-constant.controller';
import { RuleConstantService } from '../service/rule-constant.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([RuleConstant]),
    LoggerModule,
    AuthenticationModule,
    UserModule,
  ],
  controllers: [RuleConstantController],
  providers: [RuleConstantService],
  exports: [RuleConstantService],
})
export class RuleConstantModule {}
