import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsInt()
  id: number;

  @IsInt()
  is_default: boolean;

  @IsInt()
  postal_code: number;

  @IsInt()
  province: string;

  @IsInt()
  state: string;

  @IsInt()
  street1: string;

  @IsInt()
  street2: string;

  @IsInt()
  type: string;
  city: string;
  country: string;
}

class PropertyItemDto {
  @IsInt()
  id: number;

  @IsInt()
  active: boolean;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsInt()
  bathrooms: number;

  @IsInt()
  bathrooms_full: number;

  @IsInt()
  bathrooms_half: number;

  @IsInt()
  bedrooms: number;

  @IsInt()
  check_in: string;

  @IsInt()
  check_in_end: string;

  @IsInt()
  check_out: string;

  @IsInt()
  currency_code: string;

  @IsInt()
  display_order: number;

  @IsInt()
  external_display_order: number;

  @IsInt()
  external_name: string;

  @IsInt()
  internal_code: string;

  @IsInt()
  key: string;

  @IsInt()
  latitude: number;

  @IsInt()
  longitude: number;

  @IsInt()
  max_adults: number;

  @IsInt()
  max_children: number;

  @IsInt()
  max_guests: number;

  @IsInt()
  max_pets: number;

  @IsInt()
  name: string;

  @IsInt()
  owner_id: number;

  @IsInt()
  property_type: string;

  @IsInt()
  public_url: string;

  @IsInt()
  thumbnail_url: string;

  @IsInt()
  thumbnail_url_large: string;

  @IsInt()
  thumbnail_url_medium: string;
}

export class ComparePropertiesDto {
  @IsInt()
  count: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyItemDto)
  items: PropertyItemDto[];

  @IsInt()
  limit: number;

  @IsInt()
  next_page_url: string;

  @IsInt()
  offset: number;
}
