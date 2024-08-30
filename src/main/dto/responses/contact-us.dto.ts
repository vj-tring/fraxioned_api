import { IsNotEmpty } from 'class-validator';

export class ContactUsResponseDto {
  @IsNotEmpty()
  status: number;

  @IsNotEmpty()
  message: string;
}
