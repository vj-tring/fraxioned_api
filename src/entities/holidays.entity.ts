import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fx_holidays')
export class Holidays {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  name: string;

  @Column({ type: 'int', nullable: true, default: null })
  year: number;

  @Column({ name: 'start_date', type: 'date', nullable: true, default: null })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true, default: null })
  endDate: Date;
}
