import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponse } from '../commons/response-body/common.responses';
import { PROPERTY_SPACE_RESPONSES } from '../commons/constants/response-constants/property-space.constant';
import { PropertySpace } from '../entities/property-space.entity';

@Injectable()
export class PropertySpaceService {
  constructor(
    @InjectRepository(PropertySpace)
    private readonly propertySpaceRepository: Repository<PropertySpace>,
    private readonly logger: LoggerService,
  ) {}

  async handlePropertySpaceNotFound(id: number): Promise<ApiResponse<null>> {
    this.logger.error(`Property space bed with ID ${id} not found`);
    return PROPERTY_SPACE_RESPONSES.PROPERTY_SPACE_NOT_FOUND(id);
  }

  async findPropertySpaceById(id: number): Promise<PropertySpace | null> {
    return await this.propertySpaceRepository.findOne({
      relations: ['space', 'property', 'createdBy', 'updatedBy'],
      where: { id },
    });
  }
}
