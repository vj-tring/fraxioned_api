import { ApiProperty } from '@nestjs/swagger';
import { PropertySpaceDTO } from './property-space-response.dto';

export class SpaceDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  s3_url: string;

  @ApiProperty()
  isBedTypeAllowed: boolean;

  @ApiProperty()
  isBathroomTypeAllowed: boolean;

  @ApiProperty({ type: [PropertySpaceDTO] })
  propertySpaces: PropertySpaceDTO[];
}
