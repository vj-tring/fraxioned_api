import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './property.entity';
import { Amenities } from './amenities.entity';
import { User } from './user.entity';
import { PropertySpace } from './property-space.entity';

@Entity('fxn_property_amenities')
export class PropertyAmenities {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @ManyToOne(() => Property, (properties) => properties.id)
  @JoinColumn({
    name: 'property_id',
  })
  property: Property;

  @ManyToOne(() => PropertySpace, (propertySpace) => propertySpace.id)
  @JoinColumn({
    name: 'property_space_id',
  })
  propertySpace: PropertySpace;

  @ManyToOne(() => Amenities, (amenities) => amenities.id)
  @JoinColumn({
    name: 'amenity_id',
  })
  amenity: Amenities;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'created_by',
  })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'updated_by',
  })
  updatedBy: User;

  @CreateDateColumn({
    name: 'created_at',
    nullable: true,
  })
  createdAt: Date = undefined;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
  })
  updatedAt: Date = undefined;
}