import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'entities/role.entity';
import { LoggerService } from 'services/logger.service';
import { ROLE_RESPONSES } from 'src/main/commons/constants/response-constants/role.constant';
import { User } from '../entities/user.entity';
import { CreateRoleDTO } from '../dto/requests/role/createRole.dto';
import { UpdateRoleDTO } from '../dto/requests/role/updateRole.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: LoggerService,
  ) {}

  async createRole(createRoleDto: CreateRoleDTO): Promise<object> {
    const existingRole = await this.roleRepository.findOne({
      where: { roleName: createRoleDto.roleName },
    });
    if (existingRole) {
      this.logger.warn(
        `Role with name ${createRoleDto.roleName} already exists`,
      );
      return ROLE_RESPONSES.ROLE_ALREADY_EXISTS(createRoleDto.roleName);
    }

    const role = new Role();
    role.roleName = createRoleDto.roleName;
    role.roleDescription = createRoleDto.roleDescription;
    role.createdBy = createRoleDto.createdBy;

    const savedRole = await this.roleRepository.save(role);
    this.logger.log(`Role created with ID ${savedRole.id}`);
    return ROLE_RESPONSES.ROLE_CREATED(savedRole);
  }

  async getRoles(): Promise<object> {
    this.logger.log('Fetching all roles');
    const roles = await this.roleRepository.find({
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
    if (roles.length === 0) {
      this.logger.warn('No roles found');
      return ROLE_RESPONSES.ROLES_NOT_FOUND;
    }
    return ROLE_RESPONSES.ROLES_FETCHED(roles);
  }
  async getRoleById(id: number): Promise<Role> {
    this.logger.log(`Fetching role with ID ${id}`);
    const role = await this.roleRepository.findOne({
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
    if (!role) {
      this.logger.warn(`Role with ID ${id} not found`);
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDTO): Promise<object> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      this.logger.warn(`Role with ID ${id} not found`);
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    Object.assign(role, updateRoleDto);
    const updatedRole = await this.roleRepository.save(role);
    this.logger.log(`Role with ID ${id} updated`);
    return ROLE_RESPONSES.ROLE_UPDATED(updatedRole);
  }

  async deleteRole(id: number): Promise<object> {
    const result = await this.roleRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`Role with ID ${id} not found`);
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    this.logger.log(`Role with ID ${id} deleted`);
    return ROLE_RESPONSES.ROLE_DELETED;
  }
}
