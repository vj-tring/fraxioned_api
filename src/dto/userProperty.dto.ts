import { ApiProperty } from '@nestjs/swagger';

export class UserPropertyDto {
  @ApiProperty()
  propertyID: number;

  @ApiProperty()
  noOfShares: string;

  @ApiProperty()
  acquisitionDate: Date;
}
