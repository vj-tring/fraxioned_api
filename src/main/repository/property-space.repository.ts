import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertySpace } from '../entities/property-space.entity';

@Injectable()
export class PropertySpaceRepository {
  constructor(
    @InjectRepository(PropertySpace)
    private readonly repository: Repository<PropertySpace>,
  ) {}

  async findPropertySpaceBySpaceId(id: number): Promise<PropertySpace | null> {
    return await this.repository.findOne({
      where: { space: { id: id } },
    });
  }
}
