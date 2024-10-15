import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRuleConstantDto {
  @IsNotEmpty({ message: 'rule constant name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'rule constant value is required' })
  @IsNumber()
  value: number;

  @IsNotEmpty({ message: 'rule constant unit is required' })
  @IsString()
  unit: string;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id (id >= 1)',
  })
  createdBy: User;
}
