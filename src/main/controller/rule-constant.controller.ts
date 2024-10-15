import {
  Controller,
  HttpStatus,
  HttpException,
  Get,
  UseGuards,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { ApiResponse } from '../commons/response-body/common.responses';
import { RuleConstant } from '../entities/rule-constant.entity';
import { CreateRuleConstantDto } from '../dto/requests/rule-constant/create-rule-constant.dto';
import { UpdateRuleConstantDto } from '../dto/requests/rule-constant/update-rule-constant.dto';
import { RuleConstantService } from '../service/rule-constant.service';

@ApiTags('RuleConstant')
@Controller('v1/rule-constants')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class RuleConstantController {
  constructor(private readonly ruleConstantService: RuleConstantService) {}

  @Post('rule-constant')
  async createRuleConstant(
    @Body() createRuleConstantDto: CreateRuleConstantDto,
  ): Promise<ApiResponse<RuleConstant>> {
    try {
      const result = await this.ruleConstantService.createRuleConstant(
        createRuleConstantDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the rule constant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllRuleConstants(): Promise<ApiResponse<RuleConstant[]>> {
    try {
      const result = await this.ruleConstantService.getAllRuleConstants();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all the rule constants',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('rule-constant/:id')
  async getRuleConstantById(
    @Param('id') id: number,
  ): Promise<ApiResponse<RuleConstant>> {
    try {
      const result = await this.ruleConstantService.getRuleConstantById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the rule constant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('rule-constant/:id')
  async updateRuleConstantDetail(
    @Param('id') id: string,
    @Body() updateRuleConstantDto: UpdateRuleConstantDto,
  ): Promise<ApiResponse<RuleConstant>> {
    try {
      const result =
        await this.ruleConstantService.updateRuleConstantDetailById(
          +id,
          updateRuleConstantDto,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the rule constant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('rule-constant/:id')
  async deleteRuleConstant(
    @Param('id') id: number,
  ): Promise<ApiResponse<RuleConstant>> {
    try {
      const result = await this.ruleConstantService.deleteRuleConstantById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the rule constant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
