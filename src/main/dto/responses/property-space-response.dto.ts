import { ApiProperty } from '@nestjs/swagger';
import { PropertySpaceImageDTO } from './property-space-image-response.dto';

export class PropertySpaceDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  instanceNumber: number;

  @ApiProperty()
  spaceInstanceName: string;

  @ApiProperty({ type: [PropertySpaceImageDTO] })
  propertySpaceImages: PropertySpaceImageDTO[];
}
