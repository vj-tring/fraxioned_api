import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PropertyPhoto } from './property-photo.entity';
import { PropertyShareCount } from './property-share-count.entity';
import { OwnerProperty } from './owner-property.entity';
import { PropertySeasonDate } from './property-season-date.entity';

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ name: 'OSAN' })
  totalNights: number;

  @Column({ name: 'PSAN' })
  peakTotalNights: number;

  @Column({ name: 'OSAHN' })
  totalHolidayNights: number;

  @OneToMany(() => PropertyPhoto, (propertyPhoto) => propertyPhoto.property)
  photos: PropertyPhoto[];

  @ManyToOne(() => PropertyShareCount, (share) => share.properties)
  @JoinColumn({ name: 'share_id', referencedColumnName: 'id' })
  share: PropertyShareCount;

  @OneToMany(() => OwnerProperty, (ownerProperty) => ownerProperty.property)
  ownerProperties: OwnerProperty[];

  @OneToMany(
    () => PropertySeasonDate,
    (propertySeasonDate) => propertySeasonDate.property,
  )
  propertySeasonDates: PropertySeasonDate[];
}
