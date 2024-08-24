import { IsBoolean, IsNotEmpty } from 'class-validator';

export class SetActiveStatusDTO {
  @IsNotEmpty({ message: 'isActive is required' })
  @IsBoolean()
  isActive: boolean;
}
