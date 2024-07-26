import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from './users.entity';
import { Properties } from './properties.entity';

@Entity('fxn_user_properties')
export class UserProperties {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Users;

  @ManyToOne(() => Properties, (property) => property.id)
  @JoinColumn({ name: 'property_id', referencedColumnName: 'id' })
  property: Properties;

  @Column({ name: 'no_of_share', type: 'int', nullable: false, default: 0 })
  noOfShare: number;

  @Column({ name: 'acquisition_date', type: 'date', nullable: false })
  acquisitionDate: Date;

  @Column({ name: 'is_active', type: 'tinyint', nullable: false, default: 1 })
  isActive: boolean;

  @Column({ name: 'year', type: 'int', nullable: true, default: null })
  year: number;

  @Column({ name: 'psan', type: 'int', nullable: true, default: null })
  peakAllottedNights: number;

  @Column({ name: 'psun', type: 'int', nullable: false, default: 0 })
  peakUsedNights: number;

  @Column({ name: 'psbn', type: 'int', nullable: false, default: 0 })
  peakBookedNights: number;

  @Column({ name: 'pscn', type: 'int', nullable: false, default: 0 })
  peakCancelledNights: number;

  @Column({ name: 'psln', type: 'int', nullable: false, default: 0 })
  peakLostNights: number;

  @Column({ name: 'psrn', type: 'int', nullable: false, default: 0 })
  peakRemainingNights: number;

  @Column({ name: 'psahn', type: 'int', nullable: true, default: null })
  peakAllottedHolidayNights: number;

  @Column({ name: 'psuhn', type: 'int', nullable: false, default: 0 })
  peakUsedHolidayNights: number;

  @Column({ name: 'psbhn', type: 'int', nullable: false, default: 0 })
  peakBookedHolidayNights: number;

  @Column({ name: 'psrhn', type: 'int', nullable: false, default: 0 })
  peakRemainingHolidayNights: number;

  @Column({ name: 'pschn', type: 'int', nullable: true, default: null })
  peakCancelledHolidayNights: number;

  @Column({ name: 'pslhn', type: 'int', nullable: true, default: null })
  peakLostHolidayNights: number;

  @Column({ name: 'osan', type: 'int', nullable: true, default: null })
  offAllottedNights: number;

  @Column({ name: 'osun', type: 'int', nullable: false, default: 0 })
  offUsedNights: number;

  @Column({ name: 'osbn', type: 'int', nullable: false, default: 0 })
  offBookedNights: number;

  @Column({ name: 'oscn', type: 'int', nullable: false, default: 0 })
  offCancelledNights: number;

  @Column({ name: 'osln', type: 'int', nullable: false, default: 0 })
  offLostNights: number;

  @Column({ name: 'osrn', type: 'int', nullable: false, default: 0 })
  offRemainingNights: number;

  @Column({ name: 'osahn', type: 'int', nullable: true, default: null })
  offAllottedHolidayNights: number;

  @Column({ name: 'osuhn', type: 'int', nullable: false, default: 0 })
  offUsedHolidayNights: number;

  @Column({ name: 'osbhn', type: 'int', nullable: false, default: 0 })
  offBookedHolidayNights: number;

  @Column({ name: 'osrhn', type: 'int', nullable: false, default: 0 })
  offRemainingHolidayNights: number;

  @Column({ name: 'oschn', type: 'int', nullable: true, default: null })
  offCancelledHolidayNights: number;

  @Column({ name: 'oslhn', type: 'int', nullable: true, default: null })
  offLostHolidayNights: number;

  @Column({ name: 'lmban', type: 'int', nullable: true, default: null })
  lastMinuteAllottedNights: number;

  @Column({ name: 'lmbun', type: 'int', nullable: true, default: null })
  lastMinuteUsedNights: number;

  @Column({ name: 'lmbbn', type: 'int', nullable: true, default: null })
  lastMinuteBookedNights: number;

  @Column({ name: 'lmbrn', type: 'int', nullable: true, default: null })
  lastMinuteRemainingNights: number;

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdBy: Users;

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updatedBy: Users;

  @CreateDateColumn({ name: 'created_at', nullable: true, default: null })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true, default: null })
  updatedAt: Date;
}
