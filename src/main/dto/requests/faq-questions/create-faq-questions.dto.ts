import { IsString, IsNotEmpty, IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { User } from 'src/main/entities/user.entity';

export class CreateFaqQuestionsDto {
  @IsString()
  @IsNotEmpty({ message: 'Question will not be empty' })
  question: string;

  @IsString()
  @IsNotEmpty({ message: 'Answer will not be empty' })
  answer: string;

  @IsInt()
  @IsPositive()
  categoryId: number;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id (id >= 1)',
  })
  createdBy: User;
}
