import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class DeletePropertySpaceImagesDto {
  @IsArray()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  ids: number[];
}
