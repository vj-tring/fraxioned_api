import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from '@role/role.controller';
import { RoleService } from '@role/role.service';
import { CreateRoleDTO } from '@user-role/dto/create-role.dto';
import { UpdateRoleDTO } from '@user-role/dto/update-role.dto';
import { Role } from '@role/role.entity';

describe('RoleController', () => {
  let controller: RoleController;
  let roleService: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: {
            createRole: jest.fn().mockResolvedValue({
              id: 1,
              roleName: 'Admin',
              description: 'Administrator role',
              createdBy: 0,
              createdAt: new Date(),
              updatedBy: 0,
              updatedAt: new Date(),
            }),
            getRoles: jest.fn().mockResolvedValue([
              {
                id: 1,
                roleName: 'Admin',
                description: 'Administrator role',
                createdBy: 0,
                createdAt: new Date(),
                updatedBy: 0,
                updatedAt: new Date(),
              },
              {
                id: 2,
                roleName: 'User',
                description: 'User role',
                createdBy: 0,
                createdAt: new Date(),
                updatedBy: 0,
                updatedAt: new Date(),
              },
            ]),
            getRoleById: jest.fn().mockResolvedValue({
              id: 1,
              roleName: 'Admin',
              description: 'Administrator role',
              createdBy: 0,
              createdAt: new Date(),
              updatedBy: 0,
              updatedAt: new Date(),
            }),
            updateRole: jest.fn().mockResolvedValue({
              id: 1,
              roleName: 'New Admin',
              description: 'Updated description',
              createdBy: 0,
              createdAt: new Date(),
              updatedBy: 0,
              updatedAt: new Date(),
            }),
            deleteRole: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
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
        createdBy: 0,
      };
      const createdRole: Role = {
        id: 1,
        roleName: 'Admin',
        description: '',
        createdBy: 0,
        createdAt: expect.any(Date),
        updatedBy: 0,
        updatedAt: expect.any(Date),
      };
      const result = await controller.createRole(createRoleDto);
      expect(result).toEqual({
        id: 1,
        roleName: 'Admin',
        description: 'Administrator role',
        createdBy: 0,
        createdAt: expect.any(Date),
        updatedBy: 0,
        updatedAt: expect.any(Date),
      });
      expect(roleService.createRole).toHaveBeenCalledWith(createRoleDto);
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
          createdAt: expect.any(Date),
          updatedBy: 0,
          updatedAt: expect.any(Date),
        },
        {
          id: 2,
          roleName: 'User',
          description: 'User role',
          createdBy: 0,
          createdAt: expect.any(Date),
          updatedBy: 0,
          updatedAt: expect.any(Date),
        },
      ];
      jest.spyOn(roleService, 'getRoles').mockResolvedValue(roles);

      const result = await controller.getRoles();
      expect(result).toEqual([
        {
          id: 1,
          roleName: 'Admin',
          description: 'Administrator role',
          createdBy: 0,
          createdAt: expect.any(Date),
          updatedBy: 0,
          updatedAt: expect.any(Date),
        },
        {
          id: 2,
          roleName: 'User',
          description: 'User role',
          createdBy: 0,
          createdAt: expect.any(Date),
          updatedBy: 0,
          updatedAt: expect.any(Date),
        },
      ]);
      expect(roleService.getRoles).toHaveBeenCalled();
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
        createdAt: expect.any(Date),
        updatedBy: 0,
        updatedAt: expect.any(Date),
      };
      jest.spyOn(roleService, 'getRoleById').mockResolvedValue(role);

      const result = await controller.getRoleById(roleId);
      expect(result).toEqual({
        id: roleId,
        roleName: 'Admin',
        description: 'Administrator role',
        createdBy: 0,
        createdAt: expect.any(Date),
        updatedBy: 0,
        updatedAt: expect.any(Date),
      });
      expect(roleService.getRoleById).toHaveBeenCalledWith(roleId);
    });
  });

  describe('updateRole', () => {
    it('should update role', async () => {
      const roleId = 1;
      const updateRoleDto: UpdateRoleDTO = {
        roleName: 'New Admin',
        updatedBy: 0,
      };
      const updatedRole: Role = {
        id: roleId,
        roleName: 'New Admin',
        description: 'Administrator role',
        createdBy: 0,
        createdAt: expect.any(Date),
        updatedBy: 0,
        updatedAt: expect.any(Date),
      };
      const result = await controller.updateRole(roleId, updateRoleDto);
      expect(result).toEqual({
        id: roleId,
        roleName: 'New Admin',
        description: 'Updated description',
        createdBy: 0,
        createdAt: expect.any(Date),
        updatedBy: 0,
        updatedAt: expect.any(Date),
      });
      expect(roleService.updateRole).toHaveBeenCalledWith(
        roleId,
        updateRoleDto,
      );
    });
  });

  describe('deleteRole', () => {
    it('should delete role', async () => {
      const roleId = 1;
      const result = await controller.deleteRole(roleId);
      expect(result).toBeUndefined();
      expect(roleService.deleteRole).toHaveBeenCalledWith(roleId);
    });
  });
});
