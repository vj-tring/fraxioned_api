import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CalendarYear } from './calendar_year.entity';

@Entity('holidays')
export class Holidays {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  name: string;

  @ManyToOne(() => CalendarYear)
  @JoinColumn({ name: 'year_id' })
  @Index()
  year: CalendarYear;

  @Column({ type: 'date', nullable: true, default: null })
  start_date: Date;

  @Column({ type: 'date', nullable: true, default: null })
  end_date: Date;
}
