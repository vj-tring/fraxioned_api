import { ApiProperty } from '@nestjs/swagger';
import { PropertyAdditionalImageDTO } from './property-additional-image-response.dto';
import { SpaceDTO } from './space-response.dto';

export class FindPropertyImagesData {
  @ApiProperty({ type: [SpaceDTO] })
  space: SpaceDTO[];

  @ApiProperty({ type: [PropertyAdditionalImageDTO] })
  propertyAdditionalImages: PropertyAdditionalImageDTO[];
}
