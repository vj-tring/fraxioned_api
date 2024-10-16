import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRuleConstantDto {
  @IsString()
  @IsNotEmpty({ message: 'rule constant name is required' })
  @IsOptional()
  name: string;

  @IsNumber()
  @IsNotEmpty({ message: 'rule constant value is required' })
  @IsOptional()
  value: number;

  @IsString()
  @IsNotEmpty({ message: 'rule constant unit is required' })
  @IsOptional()
  unit: string;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
