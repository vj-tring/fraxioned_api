import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Properties } from 'src/main/entities/properties.entity';
import { User } from 'src/main/entities/user.entity';

export class CreatePropertyCodeDto {
  @IsNotEmpty()
  @IsInt()
  property: Properties;

  @IsNotEmpty()
  propertyCodeType: string;

  @IsNotEmpty()
  propertyCode: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  createdBy: User;
}
