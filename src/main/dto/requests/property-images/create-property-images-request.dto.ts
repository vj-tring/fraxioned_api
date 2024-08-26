import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePropertyImagesRequestDto {
  @IsNotEmpty()
  @IsString()
  propertyImages: string;
}
