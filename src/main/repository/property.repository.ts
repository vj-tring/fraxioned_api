import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from 'src/main/entities/property.entity';

@Injectable()
export class PropertyRepository {
  constructor(
    @InjectRepository(Property)
    private readonly repository: Repository<Property>,
  ) {}

  async findProperty(id: number): Promise<Property> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findOne(id: number): Promise<Property> {
    return this.repository.findOne({ where: { id } });
  }

  async saveProperty(property: Property): Promise<Property> {
    return this.repository.save(property);
  }
}
