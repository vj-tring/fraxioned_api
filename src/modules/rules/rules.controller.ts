import { Controller, Post, Body, Get } from '@nestjs/common';
import { RulesEngineService } from './rules.services';
import { RunRulesDto } from './runRuleDTO';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesEngineService: RulesEngineService) {}

  @Post('run')
  async runRules(@Body() runRulesDto: RunRulesDto) {
    this.rulesEngineService.initializeBookingRules(runRulesDto.propertyName);

    const events = await this.rulesEngineService.run(runRulesDto.facts);
    return { events };
  }
}
