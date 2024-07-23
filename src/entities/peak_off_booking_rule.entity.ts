import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('peak_off_booking_rule')
@Unique(['id'])
export class PeakOffBookingRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false, default: 3 })
  minimum_stay_length: number;

  @Column({ type: 'int', nullable: false, default: 14 })
  maximum_stay_length: number;

  @Column({ type: 'int', nullable: true, default: null })
  maxstaylength_incremental_count: number;

  @Column({ type: 'int', nullable: false, default: 5 })
  nights_between_each_booking: number;

  @Column({ type: 'tinyint', nullable: true, default: null })
  is_cancellation_allowed: number;
}