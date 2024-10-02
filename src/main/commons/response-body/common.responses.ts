import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: HttpStatus;
}
