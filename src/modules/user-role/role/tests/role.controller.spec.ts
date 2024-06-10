import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from '../role.controller';
import { RoleService } from '../role.service';
import { CreateRoleDTO } from '../../dto/create-role.dto';
import { UpdateRoleDTO } from '../../dto/update-role.dto';
import { Role } from '../role.entity';

describe('RoleController', () => {
  let controller: RoleController;
  let roleService: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [RoleService],
    }).compile();

    controller = module.get<RoleController>(RoleController);
    roleService = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRole', () => {
    it('should create a role', async () => {
      const createRoleDto: CreateRoleDTO = {
        roleName: 'Admin',
        createdBy: 0
      };
      const createdRole: Role = {
        id: 1, roleName: 'Admin',
        description: '',
        createdBy: 0,
        createdAt: undefined,
        updatedBy: 0,
        updatedAt: undefined
      };
      jest.spyOn(roleService, 'createRole').mockResolvedValue(createdRole);

      const result = await controller.createRole(createRoleDto);
      expect(result).toEqual(createdRole);
    });
  });

  describe('getRoles', () => {
    it('should get all roles', async () => {
      const roles: Role[] = [{
        id: 1, roleName: 'Admin',
        description: '',
        createdBy: 0,
        createdAt: undefined,
        updatedBy: 0,
        updatedAt: undefined
      }, {
        id: 2, roleName: 'User',
        description: '',
        createdBy: 0,
        createdAt: undefined,
        updatedBy: 0,
        updatedAt: undefined
      }];
      jest.spyOn(roleService, 'getRoles').mockResolvedValue(roles);

      const result = await controller.getRoles();
      expect(result).toEqual(roles);
    });
  });

  describe('getRoleById', () => {
    it('should get role by id', async () => {
      const roleId = 1;
      const role: Role = {
        id: roleId, roleName: 'Admin',
        description: '',
        createdBy: 0,
        createdAt: undefined,
        updatedBy: 0,
        updatedAt: undefined
      };
      jest.spyOn(roleService, 'getRoleById').mockResolvedValue(role);

      const result = await controller.getRoleById(roleId);
      expect(result).toEqual(role);
    });
  });

  describe('updateRole', () => {
    it('should update role', async () => {
      const roleId = 1;
      const updateRoleDto: UpdateRoleDTO = { roleName: 'New Admin' };
      const updatedRole: Role = {
        id: roleId, roleName: 'New Admin',
        description: '',
        createdBy: 0,
        createdAt: undefined,
        updatedBy: 0,
        updatedAt: undefined
      };
      jest.spyOn(roleService, 'updateRole').mockResolvedValue(updatedRole);

      const result = await controller.updateRole(roleId, updateRoleDto);
      expect(result).toEqual(updatedRole);
    });
  });

  describe('deleteRole', () => {
    it('should delete role', async () => {
      const roleId = 1;
      jest.spyOn(roleService, 'deleteRole').mockResolvedValue(undefined);

      const result = await controller.deleteRole(roleId);
      expect(result).toBeUndefined();
    });
  });
});
