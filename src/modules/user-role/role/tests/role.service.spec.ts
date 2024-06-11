import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from '../role.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../role.entity';
import { CreateRoleDTO } from '../../dto/create-role.dto';
import { UpdateRoleDTO } from '../../dto/update-role.dto';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(), // Add the create method to the mock repository
});

describe('RoleService', () => {
  let service: RoleService;
  let repository: MockRepository;

  beforeEach(async () => {
    repository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: getRepositoryToken(Role), useValue: repository },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
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
        createdAt: new Date(),
        updatedBy: 0,
        updatedAt: new Date(),
      };

      repository.create.mockReturnValue(createdRole);
      repository.save.mockResolvedValue(createdRole);

      const result = await service.createRole(createRoleDto);
      expect(result).toEqual(createdRole);
      expect(repository.create).toHaveBeenCalledWith(createRoleDto);
      expect(repository.save).toHaveBeenCalledWith(createdRole);
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
      ];
      repository.find.mockResolvedValue(roles);

      const result = await service.getRoles();
      expect(result).toEqual(roles);
      expect(repository.find).toHaveBeenCalled();
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
        createdAt: new Date(),
        updatedBy: 0,
        updatedAt: new Date(),
      };
      repository.findOne.mockResolvedValue(role);

      const result = await service.getRoleById(roleId);
      expect(result).toEqual(role);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: roleId } });
    });

    it('should throw NotFoundException if role not found', async () => {
      const roleId = 1;
      repository.findOne.mockResolvedValue(null);

      await expect(service.getRoleById(roleId)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('updateRole', () => {
    it('should update role', async () => {
      const roleId = 1;
      const updateRoleDto: UpdateRoleDTO = {
        roleName: 'New Admin',
        description: 'Updated description',
        updatedBy: 0
      };
      const existingRole: Role = {
        id: roleId,
        roleName: 'Admin',
        description: 'Administrator role',
        createdBy: 0,
        createdAt: new Date(),
        updatedBy: 0,
        updatedAt: new Date(),
      };
      const updatedRole: Role = {
        ...existingRole,
        ...updateRoleDto,
      };
      repository.findOne.mockResolvedValue(existingRole);
      repository.save.mockResolvedValue(updatedRole);

      const result = await service.updateRole(roleId, updateRoleDto);
      expect(result).toEqual(updatedRole);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: roleId } });
      expect(repository.save).toHaveBeenCalledWith(updatedRole);
    });
  });

  describe('deleteRole', () => {
    it('should delete role', async () => {
      const roleId = 1;
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1, raw: {} });


      await expect(service.deleteRole(roleId)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(roleId);
    });

    it('should throw NotFoundException if role not found', async () => {
      const roleId = 1;
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0, raw: {} });
      await expect(service.deleteRole(roleId)).rejects.toThrowError(NotFoundException);
    });
  });
});
