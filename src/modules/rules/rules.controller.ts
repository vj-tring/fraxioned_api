import { Controller, Post, Body, Get } from '@nestjs/common';
import { RulesEngineService } from './rules.services';
import { RunRulesDto } from './runRuleDTO';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesEngineService: RulesEngineService) {}


  @Get('run1')
  async runRules1() {
    const facts = { age: 15, country: "Canada" };
    const events = await this.rulesEngineService.run(facts);
    return { facts };
  }
  @Post('run')
  async runRules(@Body() runRulesDto: RunRulesDto) {
    this.rulesEngineService.initializeBookingRules(runRulesDto.propertyName)
    const facts = { age: 18, country: "USA" };
    const events = await this.rulesEngineService.run(runRulesDto.facts);
    return { events };
  }
}
