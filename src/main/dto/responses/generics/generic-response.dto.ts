import { HttpStatus } from '@nestjs/common';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class GenericResponseDto<T> {
  @IsNotEmpty()
  success: boolean;

  @IsNotEmpty()
  message: string;

  @IsOptional()
  data?: T;

  @IsNotEmpty()
  statusCode: HttpStatus;
}
