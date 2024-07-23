// import { Test, TestingModule } from '@nestjs/testing';
// import { RoleService } from '@role/role.service';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Role } from '@role/role.entity';
// import { CreateRoleDTO } from '@user-role/dto/create-role.dto';
// import { UpdateRoleDTO } from '@user-role/dto/update-role.dto';
// import { NotFoundException } from '@nestjs/common';
// import { Repository } from 'typeorm';
// import { LoggerService } from '@logger/logger.service';

// type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

// const createMockRepository = <T = any>(): MockRepository<T> => ({
//   findOne: jest.fn(),
//   find: jest.fn(),
//   save: jest.fn(),
//   delete: jest.fn(),
//   create: jest.fn(),
// });

// describe('RoleService', () => {
//   let service: RoleService;
//   let repository: MockRepository<Role>;
//   let logger: LoggerService;

//   const mockLogger = {
//     log: jest.fn(),
//     warn: jest.fn(),
//   };

//   beforeEach(async () => {
//     repository = createMockRepository();

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         RoleService,
//         { provide: getRepositoryToken(Role), useValue: repository },
//         { provide: LoggerService, useValue: mockLogger },
//       ],
//     }).compile();

//     service = module.get<RoleService>(RoleService);
//     logger = module.get<LoggerService>(LoggerService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('createRole', () => {
//     it('should create a role and log it', async () => {
//       const createRoleDto: CreateRoleDTO = {
//         roleName: 'Admin',
//         createdBy: 0,
//         description: 'Administrator role',
//       };
//       const createdRole: Role = {
//         id: 1,
//         roleName: 'Admin',
//         createdBy: 0,
//         description: 'Administrator role',
//         createdAt: new Date(),
//         updatedBy: 0,
//         updatedAt: new Date(),
//       };

//       repository.create.mockReturnValue(createdRole);
//       repository.save.mockResolvedValue(createdRole);

//       const result = await service.createRole(createRoleDto);
//       expect(result).toEqual(createdRole);
//       expect(repository.create).toHaveBeenCalledWith(createRoleDto);
//       expect(repository.save).toHaveBeenCalledWith(createdRole);
//       expect(logger.log).toHaveBeenCalledWith('Role created with ID 1');
//     });
//   });

//   describe('getRoles', () => {
//     it('should get all roles and log it', async () => {
//       const roles: Role[] = [
//         {
//           id: 1,
//           roleName: 'Admin',
//           description: 'Administrator role',
//           createdBy: 0,
//           createdAt: new Date(),
//           updatedBy: 0,
//           updatedAt: new Date(),
//         },
//         {
//           id: 2,
//           roleName: 'User',
//           description: 'User role',
//           createdBy: 0,
//           createdAt: new Date(),
//           updatedBy: 0,
//           updatedAt: new Date(),
//         },
//       ];
//       repository.find.mockResolvedValue(roles);

//       const result = await service.getRoles();
//       expect(result).toEqual(roles);
//       expect(repository.find).toHaveBeenCalled();
//       expect(logger.log).toHaveBeenCalledWith('Fetching all roles');
//     });
//   });

//   describe('getRoleById', () => {
//     it('should get role by id and log it', async () => {
//       const roleId = 1;
//       const role: Role = {
//         id: roleId,
//         roleName: 'Admin',
//         description: 'Administrator role',
//         createdBy: 0,
//         createdAt: new Date(),
//         updatedBy: 0,
//         updatedAt: new Date(),
//       };
//       repository.findOne.mockResolvedValue(role);

//       const result = await service.getRoleById(roleId);
//       expect(result).toEqual(role);
//       expect(repository.findOne).toHaveBeenCalledWith({
//         where: { id: roleId },
//       });
//       expect(logger.log).toHaveBeenCalledWith(
//         `Fetching role with ID ${roleId}`,
//       );
//     });

//     it('should throw NotFoundException if role not found and log it', async () => {
//       const roleId = 1;
//       repository.findOne.mockResolvedValue(null);

//       await expect(service.getRoleById(roleId)).rejects.toThrowError(
//         NotFoundException,
//       );
//       expect(logger.warn).toHaveBeenCalledWith(
//         `Role with ID ${roleId} not found`,
//       );
//     });
//   });

//   describe('updateRole', () => {
//     it('should update role and log it', async () => {
//       const roleId = 1;
//       const updateRoleDto: UpdateRoleDTO = {
//         roleName: 'New Admin',
//         description: 'Updated description',
//         updatedBy: 0,
//       };
//       const existingRole: Role = {
//         id: roleId,
//         roleName: 'Admin',
//         description: 'Administrator role',
//         createdBy: 0,
//         createdAt: new Date(),
//         updatedBy: 0,
//         updatedAt: new Date(),
//       };
//       const updatedRole: Role = {
//         ...existingRole,
//         ...updateRoleDto,
//       };
//       repository.findOne.mockResolvedValue(existingRole);
//       repository.save.mockResolvedValue(updatedRole);

//       const result = await service.updateRole(roleId, updateRoleDto);
//       expect(result).toEqual(updatedRole);
//       expect(repository.findOne).toHaveBeenCalledWith({
//         where: { id: roleId },
//       });
//       expect(repository.save).toHaveBeenCalledWith(updatedRole);
//       expect(logger.log).toHaveBeenCalledWith(`Role with ID ${roleId} updated`);
//     });
//   });

//   describe('deleteRole', () => {
//     it('should delete role and log it', async () => {
//       const roleId = 1;
//       jest
//         .spyOn(repository, 'delete')
//         .mockResolvedValue({ affected: 1, raw: {} });

//       await expect(service.deleteRole(roleId)).resolves.toBeUndefined();
//       expect(repository.delete).toHaveBeenCalledWith(roleId);
//       expect(logger.log).toHaveBeenCalledWith(`Role with ID ${roleId} deleted`);
//     });

//     it('should throw NotFoundException if role not found and log it', async () => {
//       const roleId = 1;
//       jest
//         .spyOn(repository, 'delete')
//         .mockResolvedValue({ affected: 0, raw: {} });

//       await expect(service.deleteRole(roleId)).rejects.toThrowError(
//         NotFoundException,
//       );
//       expect(logger.warn).toHaveBeenCalledWith(
//         `Role with ID ${roleId} not found`,
//       );
//     });
//   });
// });
