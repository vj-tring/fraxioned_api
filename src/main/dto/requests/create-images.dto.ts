import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { SpaceTypes } from 'src/main/entities/space-types.entity';

export class CreateImagesDto {
  @ApiProperty({ example: 'Bedroom 1' })
  @IsNotEmpty({ message: 'Image name is required' })
  @IsString()
  name: string;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'Space type ID is required' })
  @IsValidId({
    message: 'space type must be an object with a valid id where (id >= 1)',
  })
  spaceTypeId: SpaceTypes;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsNotEmpty({ message: 'Image is required' })
  imageFile: Express.Multer.File;
}
