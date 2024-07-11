import { ApiProperty } from '@nestjs/swagger';

export class PeakSeasonDto {
  @ApiProperty({ name: 'PSAN' })
  totalNights: number;

  @ApiProperty({ name: 'PSUN' })
  nightsUsed: number;

  @ApiProperty({ name: 'PSRN' })
  nightsRemaining: number;

  @ApiProperty({ name: 'PSBN' })
  nightsBooked: number;

  @ApiProperty({ name: 'PSAHN' })
  totalHolidayNights: number;

  @ApiProperty({ name: 'PSUHN' })
  holidaysUsed: number;

  @ApiProperty({ name: 'PSRHN' })
  holidaysRemaining: number;

  @ApiProperty({ name: 'PSBHN' })
  holidaysBooked: number;

  @ApiProperty({ type: 'Date', name: 'season_start' })
  start_date: string;

  @ApiProperty({ type: 'Date', name: 'season_end' })
  end_date: string;

  @ApiProperty({ name: 'year' })
  year: number;
}
