import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('calendar_year')
export class CalendarYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true, default: null })
  year: number;

  @Column({ type: 'date', nullable: true, default: null })
  start_date: Date;

  @Column({ type: 'date', nullable: true, default: null })
  end_date: Date;
}
