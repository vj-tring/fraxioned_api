import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMediaImageRequestDto {
  @IsNotEmpty()
  @IsString()
  mediaImages: string;
}
