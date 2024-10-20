import { ApiProperty } from '@nestjs/swagger';

export class PropertyAdditionalImageDTO {
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  id: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  property: {
    id: number;
    propertyName: string;
  };

  @ApiProperty()
  createdBy: {
    id: number;
  };

  @ApiProperty()
  updatedBy:
    | {
        id: number;
      }
    | number
    | null;
}
