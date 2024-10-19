import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePropertyDocumentsRequestDto {
  @IsNotEmpty()
  @IsString()
  propertyDocuments: string;
}
