import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { RoleService } from 'src/main/service/role.service';
import { Role } from 'entities/role.entity';
import { LoggerService } from 'services/logger.service';
import { NotFoundException } from '@nestjs/common';
import { ROLE_RESPONSES } from 'src/main/commons/constants/response-constants/role.constant';
import { User } from 'entities/user.entity';
import { RoleAlreadyExistsException } from 'src/main/commons/exceptions/roleName_exists';
import { CreateRoleDTO } from 'src/main/dto/requests/role/createRole.dto';
import { UpdateRoleDTO } from 'src/main/dto/requests/role/updateRole.dto';

describe('RoleService', () => {
  let service: RoleService;
  let repository: Repository<Role>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    repository = module.get<Repository<Role>>(getRepositoryToken(Role));
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const createRoleDto: CreateRoleDTO = {
        roleName: 'Admin',
        roleDescription: 'Administrator role',
        createdBy: { id: 1 } as User,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...createRoleDto,
        id: 1,
      } as unknown as Role);

      const result = await service.createRole(createRoleDto);

      expect(result).toEqual(
        ROLE_RESPONSES.ROLE_CREATED({
          ...createRoleDto,
          id: 1,
        } as unknown as Role),
      );

      expect(logger.log).toHaveBeenCalledWith(`Role created with ID 1`);
    });

    it('should throw RoleAlreadyExistsException if role already exists', async () => {
      const createRoleDto: CreateRoleDTO = {
        roleName: 'Admin',
        roleDescription: 'Administrator role',
        createdBy: { id: 1 } as User,
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(createRoleDto as unknown as Role);

      await expect(service.createRole(createRoleDto)).rejects.toThrow(
        RoleAlreadyExistsException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        `Role with name ${createRoleDto.roleName} already exists`,
      );
    });
  });

  describe('getRoles', () => {
    it('should return all roles', async () => {
      const roles = [{ roleName: 'Admin' }] as Role[];

      jest.spyOn(repository, 'find').mockResolvedValue(roles);

      const result = await service.getRoles();

      expect(result).toEqual(ROLE_RESPONSES.ROLES_FETCHED(roles));
      expect(logger.log).toHaveBeenCalledWith('Fetching all roles');
    });

    it('should return ROLES_NOT_FOUND if no roles found', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await service.getRoles();

      expect(result).toEqual(ROLE_RESPONSES.ROLES_NOT_FOUND);
      expect(logger.log).toHaveBeenCalledWith('Fetching all roles');
      expect(logger.warn).toHaveBeenCalledWith('No roles found');
    });
  });

  describe('getRoleById', () => {
    it('should return a role by ID', async () => {
      const role = { id: 1, roleName: 'Admin' } as Role;

      jest.spyOn(repository, 'findOne').mockResolvedValue(role);

      const result = await service.getRoleById(1);

      expect(result).toEqual(role);
      expect(logger.log).toHaveBeenCalledWith('Fetching role with ID 1');
    });

    it('should throw NotFoundException if role not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.getRoleById(1)).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith('Role with ID 1 not found');
    });
  });

  describe('updateRole', () => {
    it('should update role and log it', async () => {
      const roleId = 1;
      const updateRoleDto: UpdateRoleDTO = {
        roleName: 'New Admin',
        roleDescription: 'Updated description',
        updatedBy: { id: 1 } as User,
      };
      const user: User = {
        id: 1,
      } as User;

      const existingRole: Role = {
        id: roleId,
        roleName: 'Admin',
        roleDescription: 'Administrator role',
        createdBy: user,
        createdAt: new Date(),
        updatedBy: user,
        updatedAt: new Date(),
      };
      const updatedRole = {
        ...existingRole,
        ...updateRoleDto,
        updatedBy: user,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingRole);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedRole);

      const result = await service.updateRole(roleId, updateRoleDto);

      expect(result).toEqual(ROLE_RESPONSES.ROLE_UPDATED(updatedRole));
      expect(logger.log).toHaveBeenCalledWith(`Role with ID ${roleId} updated`);
    });

    it('should throw NotFoundException if role not found', async () => {
      const updateRoleDto: UpdateRoleDTO = {
        roleName: 'Updated Admin',
        roleDescription: 'Updated Administrator role',
        updatedBy: { id: 1 } as User,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.updateRole(1, updateRoleDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith('Role with ID 1 not found');
    });
  });

  describe('deleteRole', () => {
    it('should delete a role', async () => {
      const deleteResult: DeleteResult = { affected: 1 } as DeleteResult;

      jest.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      await service.deleteRole(1);

      expect(logger.log).toHaveBeenCalledWith('Role with ID 1 deleted');
    });

    it('should throw NotFoundException if role not found', async () => {
      const deleteResult: DeleteResult = { affected: 0 } as DeleteResult;

      jest.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      await expect(service.deleteRole(1)).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith('Role with ID 1 not found');
    });
  });
});
