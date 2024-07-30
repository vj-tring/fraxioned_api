import { IsNotEmpty } from 'class-validator';

export class CommonResponse {
  @IsNotEmpty()
  statusCode: number;

  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  error: string;

  @IsNotEmpty()
  timestamp: Date;

  @IsNotEmpty()
  path: string;
}
