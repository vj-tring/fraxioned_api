import { HttpStatus } from '@nestjs/common';
import { User } from 'entities/user.entity';

interface UserSuccessResponse {
  status: number;
  message: string;
  user?: Partial<User>;
  users?: Partial<User[]>;
  contactValue?: string;
}

export const USER_RESPONSES = {
  USER_ALREADY_EXISTS: (
    userId: number,
  ): { status: number; message: string } => ({
    status: HttpStatus.CONFLICT,
    message: `User with ID ${userId} already exists`,
  }),
  USER_NOT_FOUND: (
    createdBy: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `User with ID ${createdBy} not found`,
    statusCode: HttpStatus.NOT_FOUND,
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
  CONTACT_VALUE_ALREADY_EXISTS: (
    contactValue: string,
  ): UserSuccessResponse => ({
    status: HttpStatus.NOT_ACCEPTABLE,
    message: 'This email or phone already exists.',
    contactValue,
  }),
  USER_DELETED: {
    status: HttpStatus.NOT_FOUND,
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
  USER_DEACTIVATED: (id: number): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `User with ID: ${id} is Deactivated`,
  }),
  USER_ALREADY_IN_STATE: (
    p0: number,
    state: string,
  ): { status: number; message: string } => ({
    status: HttpStatus.CONFLICT,
    message: `User is already in state: ${state}`,
  }),
  USER_STATE_CHANGED: (
    p0: number,
    state: string,
  ): { status: number; message: string } => ({
    status: HttpStatus.OK,
    message: `User state changed to: ${state}`,
  }),
};
