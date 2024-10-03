import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/main/entities/user.entity';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';

export class CreateFaqCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Category name is not Empty' })
  categoryName: string;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id (id >= 1)',
  })
  createdBy: User;
}
