import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponse } from '../commons/response-body/common.responses';
import { UserService } from './user.service';
import { RuleConstant } from '../entities/rule-constant.entity';
import { CreateRuleConstantDto } from '../dto/requests/rule-constant/create-rule-constant.dto';
import { RULE_CONSTANT_RESPONSES } from '../commons/constants/response-constants/rule-constant.constant';
import { UpdateRuleConstantDto } from '../dto/requests/rule-constant/update-rule-constant.dto';

@Injectable()
export class RuleConstantService implements OnModuleInit {
  private ruleConstantsCache: Map<string, number> = new Map();

  constructor(
    @InjectRepository(RuleConstant)
    private readonly ruleConstantRepository: Repository<RuleConstant>,
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.loadRuleConstantsIntoCache();
  }

  async loadRuleConstantsIntoCache(): Promise<void> {
    try {
      const constants = await this.findAllRuleConstants();
      constants.forEach((constant) => {
        this.ruleConstantsCache.set(constant.name, constant.value);
      });
      this.logger.log('Rule constants loaded into cache successfully.');
      console.log(this.ruleConstantsCache);
    } catch (error) {
      this.logger.error(
        `Error loading rule constants into cache: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while loading rule constants into cache',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRuleConstant(name: string): Promise<number> {
    return this.ruleConstantsCache.get(name);
  }

  async refreshRuleConstantsCache(): Promise<void> {
    this.ruleConstantsCache.clear();
    await this.loadRuleConstantsIntoCache();
  }

  async findRuleConstantByName(name: string): Promise<RuleConstant | null> {
    return await this.ruleConstantRepository.findOne({
      where: { name },
    });
  }

  async saveRuleConstant(
    ruleConstant: RuleConstant,
  ): Promise<RuleConstant | null> {
    return await this.ruleConstantRepository.save(ruleConstant);
  }

  async findAllNamesOfRuleConstant(): Promise<RuleConstant[] | null> {
    return await this.ruleConstantRepository.find({
      select: ['name'],
    });
  }

  async findAllRuleConstants(): Promise<RuleConstant[] | null> {
    return await this.ruleConstantRepository.find({
      relations: ['createdBy', 'updatedBy'],
      select: {
        createdBy: {
          id: true,
        },
        updatedBy: {
          id: true,
        },
      },
    });
  }

  async findRuleConstantById(id: number): Promise<RuleConstant | null> {
    return await this.ruleConstantRepository.findOne({
      relations: ['createdBy', 'updatedBy'],
      select: {
        createdBy: {
          id: true,
        },
        updatedBy: {
          id: true,
        },
      },
      where: { id },
    });
  }

  async handleExistingRuleConstant(
    name: string,
  ): Promise<ApiResponse<RuleConstant>> {
    this.logger.error(`Rule constant with name ${name} already exists`);
    return RULE_CONSTANT_RESPONSES.RULE_CONSTANT_ALREADY_EXISTS(name);
  }

  async handleRuleConstantNotFound(id: number): Promise<ApiResponse<null>> {
    this.logger.error(`Rule constant with ID ${id} not found`);
    return RULE_CONSTANT_RESPONSES.RULE_CONSTANT_NOT_FOUND(id);
  }

  private async formatRuleConstantName(name: string): Promise<string> {
    name = name.trim();
    name = name.replace(/\s+/g, ' ');
    name = name.replace(/ /g, '_');
    name = name.replace(/[^a-zA-Z0-9_]/g, '_');
    name = name.replace(/([a-z])([A-Z])/g, '$1_$2');
    name = name.toUpperCase();

    const existingNames = await this.findAllNamesOfRuleConstant();

    const formattedNameWithoutSpecialChars = name
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();

    const matchedName = existingNames.find(
      (existing) =>
        existing.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() ===
        formattedNameWithoutSpecialChars,
    );

    if (matchedName) {
      return matchedName.name;
    }

    return name;
  }

  async createRuleConstant(
    createRuleConstantDto: CreateRuleConstantDto,
  ): Promise<ApiResponse<RuleConstant>> {
    try {
      const formattedName = await this.formatRuleConstantName(
        createRuleConstantDto.name,
      );
      createRuleConstantDto.name = formattedName;

      const existingRuleConstant =
        await this.findRuleConstantByName(formattedName);
      if (existingRuleConstant) {
        return await this.handleExistingRuleConstant(formattedName);
      }

      const existingUser = await this.userService.findUserById(
        createRuleConstantDto.createdBy.id,
      );
      if (!existingUser) {
        return await this.userService.handleUserNotFound(
          createRuleConstantDto.createdBy.id,
        );
      }

      const ruleConstant = this.ruleConstantRepository.create({
        ...createRuleConstantDto,
      });
      const savedRuleConstant = await this.saveRuleConstant(ruleConstant);

      await this.refreshRuleConstantsCache();
      this.logger.log(
        `Rule constant ${savedRuleConstant.name} created with ID ${savedRuleConstant.id}`,
      );
      return RULE_CONSTANT_RESPONSES.RULE_CONSTANT_CREATED(savedRuleConstant);
    } catch (error) {
      this.logger.error(
        `Error creating rule constant: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the rule constant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllRuleConstants(): Promise<ApiResponse<RuleConstant[]>> {
    try {
      const existingRuleConstants = await this.findAllRuleConstants();

      if (existingRuleConstants.length === 0) {
        this.logger.log(`No rule constants are available`);
        return RULE_CONSTANT_RESPONSES.RULE_CONSTANTS_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${existingRuleConstants.length} rule constants successfully.`,
      );
      return RULE_CONSTANT_RESPONSES.RULE_CONSTANTS_FETCHED(
        existingRuleConstants,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving rule constants: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all the rule constants',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRuleConstantById(id: number): Promise<ApiResponse<RuleConstant>> {
    try {
      const existingRuleConstant = await this.findRuleConstantById(id);

      if (!existingRuleConstant) {
        return await this.handleRuleConstantNotFound(id);
      }

      this.logger.log(`Rule constant with ID ${id} retrieved successfully`);
      return RULE_CONSTANT_RESPONSES.RULE_CONSTANT_FETCHED(
        existingRuleConstant,
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving rule constant with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the rule constant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateRuleConstantDetailById(
    id: number,
    updateRuleConstantDto: UpdateRuleConstantDto,
  ): Promise<ApiResponse<RuleConstant>> {
    try {
      const existingRuleConstant = await this.findRuleConstantById(id);
      if (!existingRuleConstant) {
        return await this.handleRuleConstantNotFound(id);
      }

      if (updateRuleConstantDto.name) {
        updateRuleConstantDto.name = await this.formatRuleConstantName(
          updateRuleConstantDto.name,
        );

        const ruleConstantWithSameName = await this.findRuleConstantByName(
          updateRuleConstantDto.name,
        );
        if (ruleConstantWithSameName && ruleConstantWithSameName.id !== id) {
          return await this.handleExistingRuleConstant(
            updateRuleConstantDto.name,
          );
        }
      }

      const existingUser = await this.userService.findUserById(
        updateRuleConstantDto.updatedBy.id,
      );
      if (!existingUser) {
        return await this.userService.handleUserNotFound(
          updateRuleConstantDto.updatedBy.id,
        );
      }

      Object.assign(existingRuleConstant, updateRuleConstantDto);
      const updatedRuleConstant =
        await this.saveRuleConstant(existingRuleConstant);

      await this.refreshRuleConstantsCache();

      this.logger.log(`Rule constant with ID ${id} updated successfully`);
      return RULE_CONSTANT_RESPONSES.RULE_CONSTANT_UPDATED(updatedRuleConstant);
    } catch (error) {
      this.logger.error(
        `Error updating rule constant with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the rule constant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteRuleConstantById(id: number): Promise<ApiResponse<RuleConstant>> {
    try {
      const existingRuleConstant = await this.findRuleConstantById(id);
      if (!existingRuleConstant) {
        return await this.handleRuleConstantNotFound(id);
      }

      await this.ruleConstantRepository.delete(id);

      this.logger.log(`Rule constant with ID ${id} deleted successfully`);
      return RULE_CONSTANT_RESPONSES.RULE_CONSTANT_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting rule constant with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the rule constant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
