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
import { Users } from './users.entity';

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

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({
    name: 'created_by',
  })
  createdBy: Users;

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({
    name: 'updated_by',
  })
  updatedBy: Users;

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
