import { IsNotEmpty } from 'class-validator';
import { Properties } from 'src/main/entities/properties.entity';
import { User } from 'src/main/entities/user.entity';

export class UpdatePropertyCodeDto {
  @IsNotEmpty()
  property: Properties;

  @IsNotEmpty()
  propertyCodeType: string;

  @IsNotEmpty()
  propertyCode: string;

  @IsNotEmpty()
  updatedBy: User;
}
