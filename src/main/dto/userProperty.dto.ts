import { IsInt, IsOptional } from 'class-validator';

export class UserPropertyDto {
  @IsOptional()
  @IsInt({ message: 'PropertyId must be an integer' })
  propertyID: number;

  @IsOptional()
  noOfShares: string;

  @IsOptional()
  acquisitionDate: Date;
}
