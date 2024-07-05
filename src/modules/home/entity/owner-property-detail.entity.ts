import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OwnerProperty } from './owner-property.entity';

@Entity()
export class OwnerPropertyDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  OSUN: number;

  @Column()
  OSBN: number;

  @Column()
  OSRN: number;

  @Column()
  OSUHN: number;

  @Column()
  OSBHN: number;

  @Column()
  OSRHN: number;

  @ManyToOne(
    () => OwnerProperty,
    (ownerProperty) => ownerProperty.ownerPropertyDetails,
  )
  @JoinColumn({ name: 'owner_property_id', referencedColumnName: 'id' })
  ownerProperty: OwnerProperty;
}
