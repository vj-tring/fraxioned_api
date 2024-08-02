import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertySeasonHolidayDto } from '../dto/create-property-season-holiday.dto';

export class UpdatePropertySeasonHolidayDto extends PartialType(
  CreatePropertySeasonHolidayDto,
) {}
