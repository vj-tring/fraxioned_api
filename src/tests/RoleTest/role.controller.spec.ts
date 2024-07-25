import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from 'src/controller/Role/role.controller';
import { RoleService } from 'src/service/Role/role.service';
import { CreateRoleDTO } from 'src/dto/Role/create-role.dto';
import { UpdateRoleDTO } from 'src/dto/Role/update-role.dto';
import { Role } from 'src/entities/role.entity';

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
              role_name: 'Admin',
              description: 'Administrator role',
              created_by: 0,
              created_at: new Date(),
              updated_by: 0,
              updated_at: new Date(),
            }),
            getRoles: jest.fn().mockResolvedValue([
              {
                id: 1,
                role_name: 'Admin',
                description: 'Administrator role',
                created_by: 0,
                created_at: new Date(),
                updated_by: 0,
                updated_at: new Date(),
              },
              {
                id: 2,
                role_name: 'User',
                description: 'User role',
                created_by: 0,
                created_at: new Date(),
                updated_by: 0,
                updated_at: new Date(),
              },
            ]),
            getRoleById: jest.fn().mockResolvedValue({
              id: 1,
              role_name: 'Admin',
              description: 'Administrator role',
              created_by: 0,
              created_at: new Date(),
              updated_by: 0,
              updated_at: new Date(),
            }),
            updateRole: jest.fn().mockResolvedValue({
              id: 1,
              role_name: 'New Admin',
              description: 'Updated description',
              created_by: 0,
              created_at: new Date(),
              updated_by: 0,
              updated_at: new Date(),
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
        role_name: 'Admin',
        created_by: 0,
      };
      const result = await controller.createRole(createRoleDto);
      expect(result).toEqual({
        id: 1,
        role_name: 'Admin',
        description: 'Administrator role',
        created_by: 0,
        created_at: expect.any(Date),
        updated_by: 0,
        updated_at: expect.any(Date),
      });
      expect(roleService.createRole).toHaveBeenCalledWith(createRoleDto);
    });
  });

  describe('getRoles', () => {
    it('should get all roles', async () => {
      const roles: Role[] = [
        {
          id: 1,
          role_name: 'Admin',
          description: 'Administrator role',
          created_by: 0,
          created_at: expect.any(Date),
          updated_by: 0,
          updated_at: expect.any(Date),
        },
        {
          id: 2,
          role_name: 'User',
          description: 'User role',
          created_by: 0,
          created_at: expect.any(Date),
          updated_by: 0,
          updated_at: expect.any(Date),
        },
      ];
      jest.spyOn(roleService, 'getRoles').mockResolvedValue(roles);

      const result = await controller.getRoles();
      expect(result).toEqual([
        {
          id: 1,
          role_name: 'Admin',
          description: 'Administrator role',
          created_by: 0,
          created_at: expect.any(Date),
          updated_by: 0,
          updated_at: expect.any(Date),
        },
        {
          id: 2,
          role_name: 'User',
          description: 'User role',
          created_by: 0,
          created_at: expect.any(Date),
          updated_by: 0,
          updated_at: expect.any(Date),
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
        role_name: 'Admin',
        description: 'Administrator role',
        created_by: 0,
        created_at: expect.any(Date),
        updated_by: 0,
        updated_at: expect.any(Date),
      };
      jest.spyOn(roleService, 'getRoleById').mockResolvedValue(role);

      const result = await controller.getRoleById(roleId);
      expect(result).toEqual({
        id: roleId,
        role_name: 'Admin',
        description: 'Administrator role',
        created_by: 0,
        created_at: expect.any(Date),
        updated_by: 0,
        updated_at: expect.any(Date),
      });
      expect(roleService.getRoleById).toHaveBeenCalledWith(roleId);
    });
  });

  describe('updateRole', () => {
    it('should update role', async () => {
      const roleId = 1;
      const updateRoleDto: UpdateRoleDTO = {
        role_name: 'New Admin',
        updated_by: 0,
      };

      const result = await controller.updateRole(roleId, updateRoleDto);
      expect(result).toEqual({
        id: roleId,
        role_name: 'New Admin',
        description: 'Updated description',
        created_by: 0,
        created_at: expect.any(Date),
        updated_by: 0,
        updated_at: expect.any(Date),
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
