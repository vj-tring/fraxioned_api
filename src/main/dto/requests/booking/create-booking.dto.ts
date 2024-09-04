import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { Property } from 'src/main/entities/property.entity';
import { User } from 'src/main/entities/user.entity';

export class CreateBookingDTO {
  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'user is required' })
  @IsValidId({
    message: 'user must be an object with a valid id where (id >= 1)',
  })
  user: User;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'property is required' })
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property: Property;

  @IsNotEmpty({ message: 'checkinDate is required' })
  checkinDate: Date;

  @IsNotEmpty({ message: 'checkoutDate is required' })
  checkoutDate: Date;

  @IsInt()
  @IsNotEmpty({ message: 'noOfGuests is required' })
  noOfGuests: number;

  @IsInt()
  @IsNotEmpty({ message: 'noOfPets is required' })
  noOfPets: number;

  @IsBoolean()
  @IsNotEmpty({ message: 'isLastMinuteBooking is required' })
  isLastMinuteBooking: boolean;

  @IsInt()
  @IsOptional()
  noOfAdults?: number;

  @IsInt()
  @IsOptional()
  noOfChildren?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'createdBy is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;
}
