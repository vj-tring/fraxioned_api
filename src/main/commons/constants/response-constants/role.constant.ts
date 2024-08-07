import { HttpStatus } from '@nestjs/common';
import { Role } from 'entities/role.entity';
import { RoleAlreadyExistsException } from 'src/main/commons/exceptions/roleName_exists';

interface RoleSuccessResponse {
  status: number;
  message: string;
  role?: Partial<Role>;
  roles?: Partial<Role[]>;
}

export const ROLE_RESPONSES = {
  ROLE_ALREADY_EXISTS: (roleName: string): never => {
    throw new RoleAlreadyExistsException(roleName);
  },
  ROLE_NOT_FOUND: (roleId: number): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `Role with ID ${roleId} not found`,
  }),
  ROLES_NOT_FOUND: (): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `Roles not found`,
  }),
  ROLE_CREATED: (role: Partial<Role>): RoleSuccessResponse => ({
    status: HttpStatus.CREATED,
    message: 'Role created successfully',
    role,
  }),
  ROLE_UPDATED: (role: Partial<Role>): RoleSuccessResponse => ({
    status: HttpStatus.OK,
    message: 'Role updated successfully',
    role,
  }),
  ROLE_DELETED: {
    status: HttpStatus.NOT_FOUND,
    message: 'Role deleted successfully',
  } as { status: number; message: string },
  ROLES_FETCHED: (roles: Partial<Role[]>): RoleSuccessResponse => ({
    status: HttpStatus.OK,
    message: 'Roles fetched successfully',
    roles,
  }),
  ROLE_FETCHED: (role: Partial<Role>): RoleSuccessResponse => ({
    status: HttpStatus.OK,
    message: 'Role fetched successfully',
    role,
  }),
};
