import { HttpStatus } from '@nestjs/common';
import { User } from 'src/main/entities/user.entity';
import { UserSession } from 'entities/user-session.entity';

interface LoginSuccessResponse {
  status: number;
  message: string;
  user: Partial<User>;
  session: {
    token: string;
    expires_at: Date;
  };
}

interface ErrorResponse {
  status: number;
  message: string;
}

export const LOGIN_RESPONSES = {
  USER_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    message: 'User not found',
  },
  USER_NOT_ACTIVE: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'User is not Active',
  },
  INVALID_CREDENTIALS: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Invalid credentials',
  },
  LOGIN_SUCCESS: (
    userDetails: Partial<User>,
    session: Partial<UserSession>,
  ): LoginSuccessResponse => ({
    status: HttpStatus.OK,
    message: 'Login successful',
    user: userDetails,
    session: { token: session.token, expires_at: session.expiresAt },
  }),
};

export const INVITE_USER_RESPONSES = {
  EMAIL_EXISTS: {
    status: HttpStatus.CONFLICT,
    message: 'Email already exists',
  },
  INVITE_SUCCESS: {
    status: HttpStatus.OK,
    message: 'Invite sent successfully',
  },
};

export const FORGOT_PASSWORD_RESPONSES = {
  USER_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    message: 'The account associated with this user was not found',
  },
  EMAIL_SENT: {
    status: HttpStatus.OK,
    message: 'Password reset email sent successfully',
  },
};

export const CHANGE_PASSWORD_RESPONSES = {
  USER_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    message: 'The account associated with this user was not found',
  },
  TOKEN_EXPIRED: {
    status: HttpStatus.BAD_REQUEST,
    message: 'The password reset token has expired',
  },
  PASSWORD_RESET_SUCCESS: {
    status: HttpStatus.OK,
    message: 'Password has been reset successfully',
  },
};

export const RESET_PASSWORD_RESPONSES = {
  USER_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    message: 'The account associated with this user was not found',
  },
  USER_NOT_ACTIVE: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'The user account is currently inactive',
  },
  INVALID_OLD_PASSWORD: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'The provided old password is incorrect',
  },
  PASSWORD_RESET_SUCCESS: {
    status: HttpStatus.OK,
    message: 'Password reset successfully',
  },
};

export const VALIDATE_USER_RESPONSES = {
  INVALID_SESSION: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Invalid or expired session',
  },
  USER_NOT_ACTIVE: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Invalid or inactive user',
  },
  VALIDATION_SUCCESS: {
    status: HttpStatus.OK,
    message: 'User validated successfully',
  },
};

export const LOGOUT_RESPONSES = {
  USER_NOT_FOUND: (userId: number): ErrorResponse => ({
    status: HttpStatus.NOT_FOUND,
    message: `User with ID ${userId} not found`,
  }),
  INVALID_SESSION: (userId: number, token: string): ErrorResponse => ({
    status: HttpStatus.UNAUTHORIZED,
    message: `The session for user ID ${userId} with token ${token} has expired or is invalid`,
  }),
  LOGOUT_SUCCESS: (userId: number): ErrorResponse => ({
    status: HttpStatus.OK,
    message: `Logout successful for user ID ${userId}`,
  }),
};
