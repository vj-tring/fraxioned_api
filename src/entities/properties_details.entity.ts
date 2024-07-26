import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Properties } from './properties.entity';

@Entity('fx_property_details')
export class PropertiesDetails {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @OneToOne(() => Properties, (properties) => properties.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'property_id',
  })
  propertyId: Properties;

  @Column({
    name: 'no_of_guests_allowed',
    type: 'integer',
  })
  noOfGuestsAllowed: number;

  @Column({
    name: 'no_of_bedrooms',
    type: 'integer',
  })
  noOfBedrooms: number;

  @Column({
    name: 'no_of_bathrooms',
    type: 'integer',
  })
  noOfBathrooms: number;

  @Column({
    name: 'no_of_pets_allowed',
    type: 'integer',
  })
  noOfPetsAllowed: number;

  @Column({
    name: 'square_footage',
    type: 'varchar',
  })
  squareFootage: string;

  @Column({
    name: 'check_in_time',
    type: 'time',
  })
  checkInTime: string;

  @Column({
    name: 'check_out_time',
    type: 'time',
  })
  checkOutTime: string;

  @Column({
    name: 'pet_policy',
    type: 'varchar',
  })
  petPolicy: string;

  @Column({
    name: 'fee_per_pet',
    type: 'float',
  })
  feePerPet: number;

  @Column({
    name: 'cleaning_fee',
    type: 'float',
  })
  cleaningFee: number;

  @Column({
    name: 'peak_season_start_date',
    type: 'date',
  })
  peakSeasonStartDate: Date = undefined;

  @Column({
    name: 'peak_season_end_date',
    type: 'date',
  })
  peakSeasonEndDate: Date = undefined;

  @Column({
    name: 'psan',
    type: 'integer',
  })
  psan: number;

  @Column({
    name: 'osan',
    type: 'integer',
  })
  osan: number;

  @Column({
    name: 'psahn',
    type: 'integer',
  })
  psahn: number;

  @Column({
    name: 'osahn',
    type: 'integer',
  })
  osahn: number;

  @Column({
    name: 'lmban',
    type: 'integer',
  })
  lmban: number;

  @Column({
    name: 'wifi_network',
    type: 'string',
  })
  wifiNetwork: string;
}
