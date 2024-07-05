import { ApiProperty } from '@nestjs/swagger';

export class OffSeasonDto {
  @ApiProperty({ name: 'OSAN' })
  totalNights: number;

  @ApiProperty({ name: 'OSUN' })
  nightsUsed: number;

  @ApiProperty({ name: 'OSRN' })
  nightsRemaining: number;

  @ApiProperty({ name: 'OSBN' })
  nightsBooked: number;

  @ApiProperty({ name: 'OSAHN' })
  totalHolidayNights: number;

  @ApiProperty({ name: 'OSUHN' })
  holidaysUsed: number;

  @ApiProperty({ name: 'OSRHN' })
  holidaysRemaining: number;

  @ApiProperty({ name: 'OSBHN' })
  holidaysBooked: number;
}
