import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleController } from 'src/main/controller/role.controller';
import { RoleService } from 'src/main/service/role.service';
import { Role } from 'entities/role.entity';
import { LoggerService } from 'services/logger.service';
import { User } from 'entities/user.entity';
import { Repository } from 'typeorm';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';

describe('RoleController', () => {
  let controller: RoleController;
  let service: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: AuthenticationService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
    service = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const createRoleDto = {
        roleName: 'Admin',
        roleDescription: 'Administrator role',
        createdBy: { id: 1 } as User,
      };

      const result = {
        id: 1,
        roleName: 'Admin',
        roleDescription: 'Administrator role',
        createdBy: { id: 1 } as User,
        updatedBy: { id: 1 } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'createRole').mockResolvedValue(result);

      expect(await controller.createRole(createRoleDto)).toEqual(result);
    });
  });

  describe('getRoles', () => {
    it('should return an array of roles', async () => {
      const result = [
        {
          id: 1,
          roleName: 'Admin',
          roleDescription: 'Administrator role',
          createdBy: { id: 1 } as User,
          updatedBy: { id: 1 } as User,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(service, 'getRoles').mockResolvedValue(result);

      expect(await controller.getRoles()).toEqual(result);
    });
  });

  describe('getRoleById', () => {
    it('should return a role by ID', async () => {
      const result = {
        id: 1,
        roleName: 'Admin',
        roleDescription: 'Administrator role',
        createdBy: { id: 1 } as User,
        updatedBy: { id: 1 } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'getRoleById').mockResolvedValue(result);

      expect(await controller.getRoleById(1)).toEqual(result);
    });
  });

  describe('updateRole', () => {
    it('should update a role', async () => {
      const updateRoleDto = {
        roleName: 'New Admin',
        roleDescription: 'Updated description',
        updatedBy: { id: 1 } as User,
      };

      const result = {
        id: 1,
        roleName: 'New Admin',
        roleDescription: 'Updated description',
        createdBy: { id: 1 } as User,
        updatedBy: { id: 1 } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'updateRole').mockResolvedValue(result);

      expect(await controller.updateRole(1, updateRoleDto)).toEqual(result);
    });
  });

  describe('deleteRole', () => {
    it('should delete a role', async () => {
      const result = { affected: 1 };

      jest.spyOn(service, 'deleteRole').mockResolvedValue(result);

      expect(await controller.deleteRole(1)).toEqual(result);
    });
  });
});
