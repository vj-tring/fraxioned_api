import { IsEnum, IsNotEmpty } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import {
  BathroomType,
  CountValue,
} from 'src/main/commons/constants/enumerations/space-bathroom-types.enum';

export class UpdateSpaceBathroomTypesDto {
  @IsNotEmpty({ message: 'space bathroom type name is required' })
  @IsEnum(BathroomType)
  name: BathroomType;

  @IsNotEmpty({ message: 'type count value is required' })
  @IsEnum(CountValue)
  countValue: CountValue;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
