import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'entities/role.entity';
import { CreateRoleDTO } from 'dto/createRole.dto';
import { UpdateRoleDTO } from 'dto/updateRole.dto';
import { LoggerService } from 'services/logger.service';
import { RoleAlreadyExistsException } from 'src/main/exception/roleName_exists';
import { User } from '../entities/user.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly logger: LoggerService,
  ) {}

  async createRole(createRoleDto: CreateRoleDTO): Promise<Role | object> {
    const existingRole = await this.roleRepository.findOne({
      where: { roleName: createRoleDto.roleName },
    });
    if (existingRole) {
      this.logger.warn(
        `Role with name ${createRoleDto.roleName} already exists`,
      );
      return new RoleAlreadyExistsException(createRoleDto.roleName);
    }

    const role = new Role();
    role.roleName = createRoleDto.roleName;
    role.roleDescription = createRoleDto.description;
    role.createdBy = { id: createRoleDto.createdBy } as User;

    this.logger.log(`Role created with ID ${role.id}`);
    return await this.roleRepository.save(role);
  }

  async getRoles(): Promise<Role[] | NotFoundException> {
    try {
      this.logger.log('Fetching all roles');
      const roles = await this.roleRepository.find();
      if (roles.length === 0) {
        return new NotFoundException();
      }
      return roles;
    } catch (error) {
      throw error;
    }
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
    const existingRole = await this.roleRepository.findOne({
      where: { roleName: updateRoleDto.roleName },
    });
    if (existingRole && existingRole.id !== id) {
      this.logger.warn(
        `Role with name ${updateRoleDto.roleName} already exists`,
      );
      throw new RoleAlreadyExistsException(updateRoleDto.roleName);
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
