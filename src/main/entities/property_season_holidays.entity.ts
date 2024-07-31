import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Properties } from './properties.entity';
import { Holidays } from './holidays.entity';
import { User } from './user.entity';

@Entity('fxn_property_season_holidays')
export class PropertySeasonHolidays {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @ManyToOne(() => Properties, (properties) => properties.id)
  @JoinColumn({
    name: 'property_id',
  })
  property: Properties;

  @ManyToOne(() => Holidays, (holidays) => holidays.id)
  @JoinColumn({
    name: 'holiday_id',
  })
  holiday: Holidays;

  @Column({
    name: 'is_peak_season',
    type: 'boolean',
  })
  isPeakSeason: boolean;

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
