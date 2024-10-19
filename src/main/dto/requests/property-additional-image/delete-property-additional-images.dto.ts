import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class DeletePropertyAdditionalImagesDto {
  @IsArray()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  ids: number[];
}
