import { HttpStatus } from '@nestjs/common';
import { RuleConstant } from 'src/main/entities/rule-constant.entity';

export const RULE_CONSTANT_RESPONSES = {
  RULE_CONSTANT_ALREADY_EXISTS: (
    ruleConstantName: string,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Rule constant with name ${ruleConstantName} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),
  RULE_CONSTANT_CREATED: (
    savedRuleConstant: RuleConstant,
  ): {
    success: boolean;
    message: string;
    data: RuleConstant;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Rule constant ${savedRuleConstant.name} created with ID ${savedRuleConstant.id}`,
    data: savedRuleConstant,
    statusCode: HttpStatus.CREATED,
  }),
  RULE_CONSTANTS_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: RuleConstant[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No rule constants are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  RULE_CONSTANTS_FETCHED: (
    existingRuleConstants: RuleConstant[],
  ): {
    success: boolean;
    message: string;
    data?: RuleConstant[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${existingRuleConstants.length} rule constants successfully.`,
    data: existingRuleConstants,
    statusCode: HttpStatus.OK,
  }),
  RULE_CONSTANT_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Rule constant with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  RULE_CONSTANT_FETCHED: (
    ruleConstant: RuleConstant,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: RuleConstant;
    statusCode: number;
  } => ({
    success: true,
    message: `Rule constant with ID ${id} retrieved successfully`,
    data: ruleConstant,
    statusCode: HttpStatus.OK,
  }),
  RULE_CONSTANT_UPDATED: (
    updatedRuleConstant: RuleConstant,
  ): {
    success: boolean;
    message: string;
    data?: RuleConstant;
    statusCode: number;
  } => ({
    success: true,
    message: `Rule constant with ID ${updatedRuleConstant.id} updated successfully`,
    data: updatedRuleConstant,
    statusCode: HttpStatus.OK,
  }),
  RULE_CONSTANT_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Rule constant with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
};
