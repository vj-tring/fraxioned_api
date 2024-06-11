import { Module } from '@nestjs/common';
import { RulesEngineService } from './rules.services';
import { RulesController } from './rules.controller';

@Module({
  imports: [],
  providers: [RulesEngineService],
  controllers: [RulesController],
})
export class RulesModule {}
