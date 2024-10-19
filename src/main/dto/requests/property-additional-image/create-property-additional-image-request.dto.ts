import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePropertyAdditionalImageRequestDto {
  @IsNotEmpty()
  @IsString()
  propertyAdditionalImages: string;
}
