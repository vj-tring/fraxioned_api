import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './property.entity';
import { User } from './user.entity';

@Entity('fxn_property_details')
export class PropertyDetails {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @OneToOne(() => Property, (property) => property.id)
  @JoinColumn({
    name: 'property_id',
  })
  property: Property;

  @Column({
    name: 'no_of_guests_allowed',
    type: 'integer',
  })
  noOfGuestsAllowed: number;

  @Column({
    name: 'no_of_bedrooms',
    type: 'float',
  })
  noOfBedrooms: number;

  @Column({
    name: 'no_of_bathrooms',
    default: 0,
  })
  noOfBathrooms: number;

  @Column({
    name: 'no_of_bathrooms_full',
    default: 0,
  })
  noOfBathroomsFull: number;

  @Column({
    name: 'no_of_bathrooms_half',
    default: 0,
  })
  noOfBathroomsHalf: number;

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
  })
  checkInTime: number;

  @Column({
    name: 'check_out_time',
  })
  checkOutTime: number;

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
  peakSeasonStartDate: Date;

  @Column({
    name: 'peak_season_end_date',
    type: 'date',
  })
  peakSeasonEndDate: Date;

  @Column({
    name: 'psan',
    type: 'integer',
  })
  peakSeasonAllottedNights: number;

  @Column({
    name: 'osan',
    type: 'integer',
  })
  offSeasonAllottedNights: number;

  @Column({
    name: 'psahn',
    type: 'integer',
  })
  peakSeasonAllottedHolidayNights: number;

  @Column({
    name: 'osahn',
    type: 'integer',
  })
  offSeasonAllottedHolidayNights: number;

  @Column({
    name: 'lmban',
    type: 'integer',
  })
  lastMinuteBookingAllottedNights: number;

  @Column({
    name: 'wifi_network',
    type: 'varchar',
  })
  wifiNetwork: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'created_by',
  })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'updated_by',
  })
  updatedBy: User;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
