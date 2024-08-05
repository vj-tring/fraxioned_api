import { HttpStatus } from '@nestjs/common';
import { User } from 'entities/user.entity';

interface UserSuccessResponse {
  status: number;
  message: string;
  user?: Partial<User>;
  users?: Partial<User[]>;
}

export const USER_RESPONSES = {
  USER_ALREADY_EXISTS: (
    userId: number,
  ): { status: number; message: string } => ({
    status: HttpStatus.CONFLICT,
    message: `User with ID ${userId} already exists`,
  }),
  USER_NOT_FOUND: (userId: number): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `User with ID ${userId} not found`,
  }),
  USERS_NOT_FOUND: (): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `Users not found`,
  }),
  USER_CREATED: (user: Partial<User>): UserSuccessResponse => ({
    status: HttpStatus.CREATED,
    message: 'User created successfully',
    user,
  }),
  USER_UPDATED: (user: Partial<User>): UserSuccessResponse => ({
    status: HttpStatus.OK,
    message: 'User updated successfully',
    user,
  }),
  USER_DELETED: {
    status: HttpStatus.OK,
    message: 'User deleted successfully',
  } as { status: number; message: string },
  USERS_FETCHED: (users: Partial<User[]>): UserSuccessResponse => ({
    status: HttpStatus.OK,
    message: 'Users fetched successfully',
    users,
  }),
  USER_FETCHED: (user: Partial<User>): UserSuccessResponse => ({
    status: HttpStatus.OK,
    message: 'User fetched successfully',
    user,
  }),
};
