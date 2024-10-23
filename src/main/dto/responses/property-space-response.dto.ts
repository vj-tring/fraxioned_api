import { ApiProperty } from '@nestjs/swagger';
import { PropertySpaceImageDTO } from './property-space-image-response.dto';

export class PropertySpaceDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  propertySpaceInstanceNumber: number;

  @ApiProperty()
  propertySpaceName: string;

  @ApiProperty()
  spaceId: number;

  @ApiProperty()
  spaceName: string;

  @ApiProperty({ type: [PropertySpaceImageDTO] })
  propertySpaceImages: PropertySpaceImageDTO[];
}
