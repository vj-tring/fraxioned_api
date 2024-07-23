import { Entity, Column, PrimaryGeneratedColumn, Unique, ManyToOne, JoinColumn, Index } from 'typeorm';
import { OwnerProperty } from './owner_property.entity';
import { CalendarYear } from './calendar_year.entity';

@Entity('owner_property_detail')
@Unique(['id'])
export class OwnerPropertyDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OwnerProperty)
  @JoinColumn({ name: 'owner_property_id' })
  @Index()
  owner_property: OwnerProperty;

  @ManyToOne(() => CalendarYear)
  @JoinColumn({ name: 'year_id' })
  @Index()
  year: CalendarYear;

  @Column({ type: 'int', nullable: true, default: null })
  peak_allotted_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  peak_used_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  peak_booked_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  peak_cancelled_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  peak_lost_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  peak_remaining_nights: number;

  @Column({ type: 'int', nullable: true, default: null })
  peak_allotted_holiday_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  peak_used_holiday_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  peak_booked_holiday_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  peak_remaining_holiday_nights: number;

  @Column({ type: 'int', nullable: true, default: null })
  peak_cancelled_holiday_nights: number;

  @Column({ type: 'int', nullable: true, default: null })
  peak_lost_holiday_nights: number;

  @Column({ type: 'int', nullable: true, default: null })
  off_allotted_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  off_used_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  off_booked_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  off_cancelled_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  off_lost_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  off_remaining_nights: number;

  @Column({ type: 'int', nullable: true, default: null })
  off_allotted_holiday_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  off_used_holiday_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  off_booked_holiday_nights: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  off_remaining_holiday_nights: number;

  @Column({ type: 'int', nullable: true, default: null })
  off_cancelled_holiday_nights: number;

  @Column({ type: 'int', nullable: true, default: null })
  off_lost_holiday_nights: number;

  @Column({ type: 'int', nullable: true, default: null })
  last_minute_allotted_nights: number;

  @Column({ type: 'int', nullable: true, default: null })
  last_minute_used_nights: number;

  @Column({ type: 'int', nullable: true, default: null })
  last_minute_booked_nights: number;

  @Column({ type: 'int', nullable: true, default: null })
  last_minute_remaining_nights: number;
}