import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from '../role.service';
import { Repository } from 'typeorm';
import { Role } from '../role.entity';
import { CreateRoleDTO } from '../../dto/create-role.dto';
import { UpdateRoleDTO } from '../../dto/update-role.dto';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('RoleService', () => {
  let service: RoleService;
  let repository: Repository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    repository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRole', () => {
    it('should create a role', async () => {
      const createRoleDto: CreateRoleDTO = {
        roleName: 'Admin',
        createdBy: 0,
        description: 'Administrator role',
      };
      const createdRole: Role = {
        id: 1,
        roleName: 'Admin',
        createdBy: 0,
        description: 'Administrator role',
        createdAt: undefined,
        updatedBy: 0,
        updatedAt: undefined,
      };
      jest.spyOn(repository, 'create').mockReturnValue(createdRole);
      jest.spyOn(repository, 'save').mockResolvedValue(createdRole);

      const result = await service.createRole(createRoleDto);
      expect(result).toEqual(createdRole);
    });
  });
  describe('getRoles', () => {
    it('should get all roles', async () => {
      const roles: Role[] = [
        {
          id: 1,
          roleName: 'Admin',
          description: 'Administrator role',
          createdBy: 0,
          createdAt: undefined,
          updatedBy: 0,
          updatedAt: undefined,
        },
        {
          id: 2,
          roleName: 'User',
          description: 'User role',
          createdBy: 0,
          createdAt: undefined,
          updatedBy: 0,
          updatedAt: undefined,
        },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(roles);

      const result = await service.getRoles();
      expect(result).toEqual(roles);
    });
  });

  describe('getRoleById', () => {
    it('should get role by id', async () => {
      const roleId = 1;
      const role: Role = {
        id: roleId,
        roleName: 'Admin',
        description: 'Administrator role',
        createdBy: 0,
        createdAt: undefined,
        updatedBy: 0,
        updatedAt: undefined,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(role);

      const result = await service.getRoleById(roleId);
      expect(result).toEqual(role);
    });

    it('should throw NotFoundException if role not found', async () => {
      const roleId = 1;
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.getRoleById(roleId)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('updateRole', () => {
    it('should update role', async () => {
      const roleId = 1;
      const updateRoleDto: UpdateRoleDTO = { roleName: 'New Admin', description: 'Updated description' };
      const existingRole: Role = {
        id: roleId,
        roleName: 'Admin',
        description: 'Administrator role',
        createdBy: 0,
        createdAt: undefined,
        updatedBy: 0,
        updatedAt: undefined,
      };
      const updatedRole: Role = {
        id: roleId,
        roleName: 'Admin',
        description: 'Administrator role',
        createdBy: 0,
        createdAt: undefined,
        updatedBy: 0,
        updatedAt: undefined,
      };
      jest.spyOn(service, 'getRoleById').mockResolvedValue(existingRole);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedRole);

      const result = await service.updateRole(roleId, updateRoleDto);
      expect(result).toEqual(updatedRole);
    });
  });

  describe('deleteRole', () => {
    it('should delete role', async () => {
      const roleId = 1;
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });

      await expect(service.deleteRole(roleId)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if role not found', async () => {
      const roleId = 1;
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 0, raw: {} });

      await expect(service.deleteRole(roleId)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
