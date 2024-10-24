import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Space } from '../entities/space.entity';

@Injectable()
export class SpaceRepository {
  constructor(
    @InjectRepository(Space)
    private readonly repository: Repository<Space>,
  ) {}

  async findSpaceByName(name: string): Promise<Space | null> {
    return await this.repository.findOne({
      where: { name },
    });
  }

  async findSpaceById(id: number): Promise<Space | null> {
    return await this.repository.findOne({
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

  async findSpaceByNameExcludingId(
    name: string,
    id: number,
  ): Promise<Space | null> {
    return await this.repository.findOne({
      where: { name, id: Not(id) },
    });
  }

  async findAllSpaces(): Promise<Space[] | null> {
    return await this.repository.find({
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

  async saveSpace(space: Space): Promise<Space> {
    return await this.repository.save(space);
  }

  async createSpace(spaceData: Partial<Space>): Promise<Space> {
    return this.repository.create(spaceData);
  }

  async deleteSpace(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
