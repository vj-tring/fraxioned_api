import { ApiProperty } from "@nestjs/swagger";

export class PropertyDetailsDto {
    id: number;

    property_id: number;

    @ApiProperty()
    no_of_guests_allowed: number;

    @ApiProperty()
    no_of_bedrooms: number;

    @ApiProperty()
    no_of_bathrooms: number;

    @ApiProperty()
    no_of_pets_allowed: number;

    @ApiProperty()
    square_footage: String;

    @ApiProperty()
    check_in_time: Date;

    @ApiProperty()
    check_out_time: number;

    @ApiProperty()
    pet_policy: String;

    @ApiProperty()
    fee_per_pet: number;
    
    @ApiProperty()
    cleaning_fee: number;

    @ApiProperty()
    peakSeasonStartDate: number;

    @ApiProperty()
    peakSeasonEndDate: number;

    @ApiProperty()
    peakSeasonAllottedNights: number;

    @ApiProperty()
    offSeasonAllottedNights: number;

    @ApiProperty()
    peakSeasonAllottedHolidayNights: number;

    @ApiProperty()
    offSeasonAllottedHolidayNights: number;

    @ApiProperty()
    lastMinuteBookingAllottedNights: number;
    
    @ApiProperty()
    wifi_network: String;

    @ApiProperty()
    created_by: String;

    @ApiProperty()
    updated_by: String;

    @ApiProperty()
    created_at: Date;

    @ApiProperty()
    updated_at: Date;
}