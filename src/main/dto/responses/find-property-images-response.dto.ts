import { ApiProperty } from '@nestjs/swagger';
import { PropertyAdditionalImageDTO } from './property-additional-image-response.dto';
import { PropertySpaceDTO } from './property-space-response.dto';
import { PropertySpaceTotalsDTO } from './property-space-totals-response.dto';

export class FindPropertyImagesData {
  @ApiProperty({ type: [PropertySpaceDTO] })
  propertySpace: PropertySpaceDTO[];

  @ApiProperty({ type: [PropertyAdditionalImageDTO] })
  propertyAdditionalImages: PropertyAdditionalImageDTO[];

  @ApiProperty({ type: PropertySpaceTotalsDTO })
  totals: PropertySpaceTotalsDTO;
}
