import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyDetails } from 'src/main/entities/property-details.entity';

@Injectable()
export class PropertyDetailsRepository {
  constructor(
    @InjectRepository(PropertyDetails)
    private readonly repository: Repository<PropertyDetails>,
  ) {}

  async findOne(id: number): Promise<PropertyDetails | undefined> {
    return this.repository.findOne({ where: { id } });
  }
}
