import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertySeasonHolidayDto } from 'dto/requests/create-property-season-holiday.dto';

export class UpdatePropertySeasonHolidayDto extends PartialType(
  CreatePropertySeasonHolidayDto,
) {}
