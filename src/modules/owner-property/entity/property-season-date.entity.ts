import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Property } from './property.entity';
import { Season } from './season.entity';
import { Years } from './years.entity';
import { OwnerProperty } from './owner-property.entity';

@Entity()
export class PropertySeasonDate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'property_id' })
  propertyId: number;

  @Column({ name: 'season_start', type: 'date' })
  season_start: string;

  @Column({ name: 'season_end', type: 'date' })
  season_end: string;

  @Column({ name: 'season_id' })
  seasonId: number;

  @Column({ name: 'year_id' })
  yearId: number;

  @ManyToOne(() => Property, (property) => property.propertySeasonDates)
  @JoinColumn({ name: 'property_id', referencedColumnName: 'id' })
  property: Property;

  @ManyToOne(() => Season, (season) => season.id)
  @JoinColumn({ name: 'season_id', referencedColumnName: 'id' })
  season: Season;

  @ManyToOne(() => Years, (year) => year.id)
  @JoinColumn({ name: 'year_id', referencedColumnName: 'id' })
  year: Years;

  @ManyToOne(
    () => OwnerProperty,
    (ownerProperty) => ownerProperty.ownerPropertyDetails,
  )
  @JoinColumn({ name: 'owner_property_id', referencedColumnName: 'id' })
  ownerProperty: OwnerProperty;
}
