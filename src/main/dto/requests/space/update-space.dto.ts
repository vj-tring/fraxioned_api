import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSpaceDto {
  @IsString()
  @IsNotEmpty({ message: 'space name is required' })
  @IsOptional()
  name: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'The isBedTypeAllowed field is required' })
  @IsOptional()
  isBedTypeAllowed: boolean;

  @IsBoolean()
  @IsNotEmpty({ message: 'The isBathroomTypeAllowed field is required' })
  @IsOptional()
  isBathroomTypeAllowed: boolean;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
