import { IsNumber } from 'class-validator';

export class PropertySpaceTotalsDTO {
  @IsNumber()
  total_number_of_bedrooms: number;

  @IsNumber()
  total_number_of_bathrooms: number;

  @IsNumber()
  total_number_of_beds: number;

  constructor(
    totalBedrooms: number,
    totalBathrooms: number,
    totalBeds: number,
  ) {
    this.total_number_of_bedrooms = totalBedrooms;
    this.total_number_of_bathrooms = totalBathrooms;
    this.total_number_of_beds = totalBeds;
  }
}
