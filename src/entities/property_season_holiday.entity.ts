import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Property } from './property.entity';
import { Holidays } from './holidays.entity';
import { Season } from './season.entity';

@Entity('property_season_holiday')
export class PropertySeasonHoliday {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  @Index()
  property: Property;

  @ManyToOne(() => Holidays)
  @JoinColumn({ name: 'holiday_id' })
  @Index()
  holiday: Holidays;

  @ManyToOne(() => Season)
  @JoinColumn({ name: 'season_id' })
  @Index()
  season: Season;
}
