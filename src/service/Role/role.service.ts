import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'entities/role.entity';
import { CreateRoleDTO } from 'src/dto/Role/create-role.dto';
import { UpdateRoleDTO } from 'src/dto/Role/update-role.dto';
import { LoggerService } from 'src/service/Logger/logger.service';
import { RoleAlreadyExistsException } from 'src/exception/role/role_name_exists';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly logger: LoggerService,
  ) {}

  async createRole(createRoleDto: CreateRoleDTO): Promise<Role> {
    if (!createRoleDto.role_name) {
      throw new BadRequestException('role_name is required');
    }
    if (!createRoleDto.created_by) {
      throw new BadRequestException('created_by is required');
    }
    const existingRole = await this.roleRepository.findOne({ where: { role_name: createRoleDto.role_name } });
    if (existingRole) {
      this.logger.warn(`Role with name ${createRoleDto.role_name} already exists`);
      throw new RoleAlreadyExistsException(createRoleDto.role_name);
    }

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
    if (!updateRoleDto.role_name) {
      throw new BadRequestException('role_name is required');
    }
    if (!updateRoleDto.updated_by) {
      throw new BadRequestException('updated_by is required');
    }
    const existingRole = await this.roleRepository.findOne({ where: { role_name: updateRoleDto.role_name } });
    if (existingRole && existingRole.id !== id) {
      this.logger.warn(`Role with name ${updateRoleDto.role_name} already exists`);
      throw new RoleAlreadyExistsException(updateRoleDto.role_name);
    }  
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
