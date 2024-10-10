import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePropertySpaceImageRequestDto {
  @IsNotEmpty()
  @IsString()
  propertySpaceImage: string;
}
