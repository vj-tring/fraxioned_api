import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsBoolean,
  ValidateIf,
} from 'class-validator';

export enum ReportFormat {
  XML = 'xml',
  EXCEL = 'excel',
  PDF = 'pdf',
}
export enum ReportContent {
  AllDetails = 'alldetails',
  OnlyBookingDetails = 'onlybookingdetails',
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

  @IsOptional()
  @IsBoolean()
  isCancelled?: boolean;

  @IsOptional()
  @IsBoolean()
  isLastminBooking?: boolean;

  @IsOptional()
  @IsBoolean()
  ismodifiedBooking?: boolean;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsBoolean()
  withPets?: boolean;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsEnum(ReportContent)
  content: ReportContent;

  @ValidateIf((o) => !o.propertyId && !o.userId && !(o.fromDate && o.toDate))
  validateRequiredFilters(): void {
    throw new Error(
      'At least one of propertyId, userId, or date range must be provided.',
    );
  }
}
