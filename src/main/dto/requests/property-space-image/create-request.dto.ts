import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePropertySpaceImageRequestDto {
  @IsNotEmpty()
  @IsString()
  propertySpaceImages: string;
}
