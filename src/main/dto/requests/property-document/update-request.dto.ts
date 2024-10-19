import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePropertyDocumentRequestDto {
  @IsNotEmpty()
  @IsString()
  propertyDocument: string;
}
