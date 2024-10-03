import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/main/entities/user.entity';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';

export class UpdateFaqCategoryDto {
  @IsString()
  @IsOptional()
  categoryName?: string;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
