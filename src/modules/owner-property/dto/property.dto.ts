import { ApiProperty } from '@nestjs/swagger';

export class PropertyDTO {
  @ApiProperty({ name: 'image_url' })
  image: string;

  @ApiProperty({ name: 'name' })
  name: string;

  @ApiProperty({ name: 'address' })
  address: string;

  @ApiProperty({ name: 'no_of_share' })
  numberOfShares: number;

  @ApiProperty({ name: 'share_type' })
  totalShares: number;
}
