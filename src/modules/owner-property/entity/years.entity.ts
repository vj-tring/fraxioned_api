import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PropertySeasonDate } from './property-season-date.entity';

@Entity()
export class Years {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  year: number;

  @OneToMany(() => PropertySeasonDate, (year) => year.id)
  years: PropertySeasonDate[];
}
