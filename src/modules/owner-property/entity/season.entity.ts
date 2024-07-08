import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PropertySeasonDate } from './property-season-date.entity';

@Entity()
export class Season {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(
    () => PropertySeasonDate,
    (propertySeasonDate) => propertySeasonDate.season,
  )
  propertySeasonDates: PropertySeasonDate[];
}
