import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { CountValue } from 'src/main/commons/constants/enumerations/space-bathroom-types.enum';
import { Transform } from 'class-transformer';

export class CreateSpaceBathroomTypesDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  imageFile?: Express.Multer.File;

  @IsNotEmpty({ message: 'space bathroom type name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'type count value is required' })
  @IsEnum(CountValue)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const numValue = parseFloat(value);
      return Object.values(CountValue).includes(numValue)
        ? numValue
        : undefined;
    }
    return value;
  })
  countValue: CountValue;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id (id >= 1)',
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? JSON.parse(value) : value;
  })
  createdBy: User;
}
