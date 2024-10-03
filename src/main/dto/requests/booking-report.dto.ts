import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';

export enum ReportFormat {
  XML = 'xml',
  EXCEL = 'excel',
  PDF = 'pdf',
}

export class BookingReportDto {
  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsEnum(ReportFormat)
  format: ReportFormat;
}
