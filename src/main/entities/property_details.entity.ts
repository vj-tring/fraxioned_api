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
import { Properties } from './properties.entity';
import { User } from './user.entity';

@Entity('fxn_property_details')
export class PropertyDetails {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @OneToOne(() => Properties, (properties) => properties.id)
  @JoinColumn({
    name: 'property_id',
  })
  property: Properties;

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
    nullable: true,
  })
  createdAt: Date = undefined;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
  })
  updatedAt: Date = undefined;
}
