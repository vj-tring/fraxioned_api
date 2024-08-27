import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePropertyImageRequestDto {
  @IsNotEmpty()
  @IsString()
  propertyImage: string;
}
