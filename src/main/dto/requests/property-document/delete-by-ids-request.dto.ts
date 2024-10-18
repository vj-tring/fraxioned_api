import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class DeletePropertyDocumentsDto {
  @IsArray()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  ids: number[];
}
