import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Property } from './property.entity';
import { PropertySeasonDate } from './property_season_date.entity';

@Entity('booking')
@Unique(['id'])
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  @Index()
  property: Property;

  @Column({ type: 'date', nullable: false })
  checkin_date: Date;

  @Column({ type: 'date', nullable: false })
  checkout_date: Date;

  @Column({ type: 'int', nullable: false })
  no_of_guests: number;

  @Column({ type: 'int', nullable: false })
  no_of_pets: number;

  @ManyToOne(() => PropertySeasonDate)
  @JoinColumn({ name: 'property_season_id' })
  @Index()
  property_season: PropertySeasonDate;

  @Column({ type: 'date', nullable: true, default: null })
  booked_date: Date;

  @Column({ type: 'date', nullable: true, default: null })
  cancelled_date: Date;

  @Column({ type: 'date', nullable: true, default: null })
  updated_date: Date;

  @Column({ type: 'tinyint', nullable: false })
  is_last_minute_booking: number;

  @Column({ type: 'tinyint', nullable: false, default: 0 })
  is_lost_nights_or_not: number;

  @Column({ type: 'int', nullable: true, default: null })
  no_of_adults: number;

  @Column({ type: 'int', nullable: true, default: null })
  no_of_children: number;

  @Column({ type: 'int', nullable: true, default: null })
  no_of_infants: number;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  notes: string;

  @Column({ type: 'varchar', length: 50, nullable: true, default: null })
  confirmation_code: string;

  @Column({ type: 'varchar', length: 45, nullable: true, default: null })
  booked_time: string;
}
