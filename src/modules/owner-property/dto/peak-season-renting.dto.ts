import { ApiProperty } from '@nestjs/swagger';

export class PeakSeasonRentingDto {
  @ApiProperty({ type: 'Date', name: 'season_start' })
  start_date: string;

  @ApiProperty({ type: 'Date', name: 'season_end' })
  end_date: string;

  @ApiProperty({ name: 'year' })
  year: number;

  @ApiProperty({ name: 'PSAN' })
  peakTotalNights: number;

  @ApiProperty({ name: 'night_staying' })
  night_staying: number;

  @ApiProperty({ name: 'night_renting' })
  night_renting: number;

  @ApiProperty({ name: 'nights_undecided' })
  nights_undecided: number;
}
