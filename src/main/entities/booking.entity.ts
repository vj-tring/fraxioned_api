import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Property } from './property.entity';

@Entity('fxn_booking')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Property, (property) => property.id)
  @JoinColumn({ name: 'property_id', referencedColumnName: 'id' })
  property: Property;

  @Column({ name: 'checkin_at', type: 'timestamp', nullable: false })
  checkinDate: Date;

  @Column({ name: 'checkout_at', type: 'timestamp', nullable: false })
  checkoutDate: Date;

  @Column({ name: 'no_of_guests', type: 'int', nullable: false })
  noOfGuests: number;

  @Column({ name: 'no_of_pets', type: 'int', nullable: false })
  noOfPets: number;

  @CreateDateColumn({ name: 'created_at', default: null })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', default: null })
  updatedAt: Date;

  @Column({
    name: 'cancelled_at',
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  cancelledAt: Date;

  @Column({ name: 'is_last_minute_booking', type: 'tinyint', nullable: false })
  isLastMinuteBooking: boolean;

  @Column({ name: 'no_of_adults', type: 'int', nullable: true, default: null })
  noOfAdults: number;

  @Column({
    name: 'no_of_children',
    type: 'int',
    nullable: true,
    default: null,
  })
  noOfChildren: number;

  @Column({ name: 'no_of_infants', type: 'int', nullable: true, default: null })
  noOfInfants: number;

  @Column({ type: 'varchar', length: 1000, nullable: true, default: null })
  notes: string;

  @Column({
    name: 'confirmation_code',
    type: 'varchar',
    length: 50,
    nullable: true,
    default: null,
  })
  confirmationCode: string;

  @Column({
    name: 'cleaning_fee',
    type: 'float',
    nullable: true,
    default: null,
  })
  cleaningFee: number;

  @Column({ name: 'pet_fee', type: 'float', nullable: true, default: null })
  petFee: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updatedBy: User;
}
