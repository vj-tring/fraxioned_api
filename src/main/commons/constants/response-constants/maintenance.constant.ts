import { HttpStatus } from '@nestjs/common';

export const MAINTENANCE_RESPONSES = {
  USER_ACCOUNT_INVALID: (): { status: number; message: string } => ({
    status: HttpStatus.UNAUTHORIZED,
    message: `The user account is invalid`,
  }),
  USER_ACCOUNT_STATUS: (): { status: number; message: string } => ({
    status: HttpStatus.UNAUTHORIZED,
    message: `The user account is currently inactive`,
  }),
  USER_ACCOUNT_EMAIL: (): { status: number; message: string } => ({
    status: HttpStatus.UNAUTHORIZED,
    message: `The user email is invalid`,
  }),
  USER_ACCOUNT_ADMIN_EMAIL: (): { status: number; message: string } => ({
    status: HttpStatus.UNAUTHORIZED,
    message: `The admin email is invalid or missed`,
  }),
  TICKET_SUCCESS: (): { status: number; message: string } => ({
    status: HttpStatus.OK,
    message: `Ticket raised successfully`,
  }),
};
