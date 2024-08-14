import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Property } from 'src/main/entities/property.entity';
import { User } from 'src/main/entities/user.entity';

export class UpdatePropertyCodeDto {
  @IsNotEmpty()
  @IsInt()
  property: Property;

  @IsNotEmpty()
  propertyCodeType: string;

  @IsNotEmpty()
  propertyCode: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  updatedBy: User;
}
