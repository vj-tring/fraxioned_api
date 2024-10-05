import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSpaceBedTypeDto {
  @IsString()
  @IsOptional()
  bedType: string;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'Updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
