import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { PropertySeasonHolidays } from './property-season-holidays.entity';

@Entity('fxn_holidays')
export class Holidays {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  name: string;

  @Column({ type: 'int', nullable: true, default: null })
  year: number;

  @Column({
    name: 'start_date',
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  startDate: Date;

  @Column({
    name: 'end_date',
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  endDate: Date;

  @CreateDateColumn({ name: 'created_at', nullable: true, default: null })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true, default: null })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updatedBy: User;

  @OneToMany(
    () => PropertySeasonHolidays,
    (propertySeasonHolidays) => propertySeasonHolidays.holiday,
  )
  propertySeasonHolidays: PropertySeasonHolidays[];
}
