import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Properties } from './properties.entity';
import { Holidays } from './holidays.entity';

@Entity('fx_property_season_holidays')
export class PropertiesSeasonHolidays {
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
}
