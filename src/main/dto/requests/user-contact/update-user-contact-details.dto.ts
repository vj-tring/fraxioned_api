import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { User } from 'src/main/entities/user.entity';

export class UpdateUserContactDetailsDTO {
  @IsString()
  @IsNotEmpty({ message: 'contactType is required' })
  contactType: string;

  @IsString()
  @IsNotEmpty({ message: 'contactValue is required' })
  contactValue: string;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'updatedBy is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
