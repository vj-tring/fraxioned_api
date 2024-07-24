import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('last_minute_booking_rule')
@Unique(['id'])
export class LastMinuteBookingRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false, default: 1 })
  minimum_stay_length: number;

  @Column({ type: 'int', nullable: false, default: 3 })
  maximum_stay_length: number;

  @Column({ type: 'int', nullable: true, default: null })
  not_reserved_nights: number;

  @Column({ type: 'tinyint', nullable: true, default: null })
  is_cancellation_allowed: number;
}
