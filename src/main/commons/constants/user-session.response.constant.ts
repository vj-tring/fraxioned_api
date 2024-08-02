import { HttpStatus } from '@nestjs/common';
import { UserSession } from 'entities/user-session.entity';

interface UserSessionSuccessResponse {
  status: number;
  message: string;
  userSession?: Partial<UserSession>;
  userSessions?: Partial<UserSession[]>;
}

export const USER_SESSION_RESPONSES = {
  USER_SESSION_NOT_FOUND: (
    sessionId: number,
  ): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `User session with ID ${sessionId} not found`,
  }),
  USER_SESSIONS_NOT_FOUND: (): { status: number; message: string } => ({
    status: HttpStatus.NOT_FOUND,
    message: `User sessions not found`,
  }),
  USER_SESSION_CREATED: (
    userSession: Partial<UserSession>,
  ): UserSessionSuccessResponse => ({
    status: HttpStatus.CREATED,
    message: 'User session created successfully',
    userSession,
  }),
  USER_SESSION_UPDATED: (
    userSession: Partial<UserSession>,
  ): UserSessionSuccessResponse => ({
    status: HttpStatus.OK,
    message: 'User session updated successfully',
    userSession,
  }),
  USER_SESSION_DELETED: {
    status: HttpStatus.OK,
    message: 'User session deleted successfully',
  } as { status: number; message: string },
  USER_SESSIONS_FETCHED: (
    userSessions: Partial<UserSession[]>,
  ): UserSessionSuccessResponse => ({
    status: HttpStatus.OK,
    message: 'User sessions fetched successfully',
    userSessions,
  }),
  USER_SESSION_FETCHED: (
    userSession: Partial<UserSession>,
  ): UserSessionSuccessResponse => ({
    status: HttpStatus.OK,
    message: 'User session fetched successfully',
    userSession,
  }),
};
