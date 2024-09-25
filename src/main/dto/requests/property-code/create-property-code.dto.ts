import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { PropertyCodeCategory } from 'src/main/entities/property-code-category.entity';
import { Property } from 'src/main/entities/property.entity';
import { User } from 'src/main/entities/user.entity';

export class CreatePropertyCodeDto {
  @IsNotEmpty()
  @IsInt()
  property: Property;

  @IsNotEmpty()
  propertyCodeCategory: PropertyCodeCategory;

  @IsNotEmpty()
  propertyCode: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  createdBy: User;
}
