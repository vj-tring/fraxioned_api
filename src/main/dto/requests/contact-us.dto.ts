import { IsInt, IsNotEmpty } from 'class-validator';

export class ContactUsDto {
  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  comments: string;

  @IsInt()
  senderId: number;
}
