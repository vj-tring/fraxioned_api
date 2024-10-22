import { ApiProperty } from '@nestjs/swagger';

export class PropertySpaceImageDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  displayOrder: number;
}
