import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Property } from './property.entity';
import { Season } from './season.entity';
import { CalendarYear } from './calendar_year.entity';

@Entity('property_season_date')
export class PropertySeasonDate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  @Index()
  property: Property;

  @ManyToOne(() => Season)
  @JoinColumn({ name: 'season_id' })
  @Index()
  season: Season;

  @ManyToOne(() => CalendarYear)
  @JoinColumn({ name: 'year_id' })
  @Index()
  year: CalendarYear;

  @Column({ type: 'date', nullable: false })
  start_date: Date;

  @Column({ type: 'date', nullable: false })
  end_date: Date;
}
