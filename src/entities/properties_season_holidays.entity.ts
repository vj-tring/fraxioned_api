import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Properties } from './properties.entity';

@Entity('fx_property_season_holidays')
export class PropertiesSeasonHolidays {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @OneToOne(() => Properties, (properties) => properties.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'property_id',
  })
  propertyId: Properties;

  @Column({
    name: 'holiday_id',
    type: 'integer',
  })
  holidayId: number;

  @Column({
    name: 'is_peak_season',
    type: 'boolean',
  })
  isPeakSeason: boolean;
}
