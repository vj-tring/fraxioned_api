import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Property } from './property.entity';
import { OwnerPropertyDetail } from './owner-property-detail.entity';

@Entity()
export class OwnerProperty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'property_id' })
  propertyId: number;

  @Column({ name: 'no_of_share' })
  noOfShare: number;

  @Column({ name: 'is_active' })
  isActive: boolean;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Property, (property) => property.ownerProperties)
  @JoinColumn({ name: 'property_id', referencedColumnName: 'id' })
  property: Property;

  @OneToMany(
    () => OwnerPropertyDetail,
    (ownerPropertyDetail) => ownerPropertyDetail.ownerProperty,
  )
  ownerPropertyDetails: OwnerPropertyDetail[];
}
