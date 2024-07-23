import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@entities/role.entity';
import { CreateRoleDTO } from '@user-role/dto/create-role.dto';
import { UpdateRoleDTO } from '@user-role/dto/update-role.dto';
import { LoggerService } from '@logger/logger.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly logger: LoggerService,
  ) {}

  async createRole(createRoleDto: CreateRoleDTO): Promise<Role> {
    const role = this.roleRepository.create(createRoleDto);
    this.logger.log(`Role created with ID ${role.id}`);
    return await this.roleRepository.save(role);
  }

  async getRoles(): Promise<Role[]> {
    this.logger.log('Fetching all roles');
    return await this.roleRepository.find();
  }

  async getRoleById(id: number): Promise<Role> {
    this.logger.log(`Fetching role with ID ${id}`);
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      this.logger.warn(`Role with ID ${id} not found`);
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDTO): Promise<Role> {
    const role = await this.getRoleById(id);
    Object.assign(role, updateRoleDto);
    this.logger.log(`Role with ID ${id} updated`);
    return await this.roleRepository.save(role);
  }

  async deleteRole(id: number): Promise<void> {
    const result = await this.roleRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`Role with ID ${id} not found`);
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    this.logger.log(`Role with ID ${id} deleted`);
  }
}
