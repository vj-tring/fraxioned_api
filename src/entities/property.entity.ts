import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { RentalType } from './rental_type.entity';

@Entity('property')
@Unique(['id'])
@Unique(['name'])
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @ManyToOne(() => RentalType, { nullable: false })
  @JoinColumn({ name: 'rental_type' })
  @Index()
  rental_type: RentalType;

  @Column({ type: 'int', nullable: true, default: null })
  share_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  city: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  state: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  country: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  zip: string;

  @Column({ type: 'int', nullable: true, default: null })
  no_of_guests_allowed: number;

  @Column({ type: 'float', nullable: true, default: null })
  no_of_bedrooms: number;

  @Column({ type: 'float', nullable: true, default: null })
  no_of_bathrooms: number;

  @Column({ type: 'varchar', length: 45, nullable: true, default: null })
  square_footage: string;

  @Column({ type: 'varchar', length: 45, nullable: true, default: null })
  checkin_time: string;

  @Column({ type: 'varchar', length: 45, nullable: true, default: null })
  checkout_time: string;

  @Column({ type: 'varchar', length: 5000, nullable: true, default: null })
  house_description: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  checkout_instructions: string;

  @Column({ type: 'int', nullable: true, default: null })
  cleaning_fee: number;

  @Column({ type: 'int', nullable: true, default: null })
  no_of_pets_allowed: number;

  @Column({ type: 'varchar', length: 45, nullable: true, default: null })
  pet_policy: string;

  @Column({ type: 'int', nullable: true, default: null })
  fee_per_pet: number;

  @Column({ type: 'int', nullable: true, default: null })
  peak_allotted_nights: number;

  @Column({ type: 'int', nullable: true, default: null })
  off_allotted_nights: number;

  @Column({ type: 'int', nullable: true, default: null })
  peak_allotted_holiday_nights: number;

  @Column({ type: 'int', nullable: true, default: null })
  off_allotted_holiday_nights: number;

  @Column({ type: 'int', nullable: true, default: null })
  last_minute_allotted_nights: number;

  @Column({ type: 'int', nullable: false })
  created_by: number;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'int', nullable: true, default: null })
  updated_by: number;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @Column({ type: 'int', nullable: false, default: 1 })
  peak_season_term: number;

  @Column({ type: 'int', nullable: false, default: 1 })
  off_season_term: number;

  @Column({ type: 'int', nullable: false, default: 2 })
  peak_season_holiday_term: number;

  @Column({ type: 'int', nullable: false, default: 1 })
  off_season_holiday_term: number;

  @Column({ type: 'int', nullable: true, default: null })
  last_minute_booking_term: number;

  @Column({ type: 'int', nullable: false, default: 7 })
  cancellation_day_limit: number;

  @Column({ type: 'point', nullable: true, default: null })
  map_coordinates: string;

  @Column({ type: 'tinyint', nullable: true, default: null })
  is_refund_cancellation_available: number;

  @Column({ type: 'int', nullable: true, default: null })
  cancellation_days_before: number;
}
