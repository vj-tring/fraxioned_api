import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMediaImageRequestDto {
  @IsNotEmpty()
  @IsString()
  mediaImage: string;
}
