import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Properties } from './properties.entity';
import { Amenities } from './amenities.entity';
import { Users } from './users.entity';

@Entity('fxn_property_amenities')
export class PropertyAmenities {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @ManyToOne(() => Properties, (properties) => properties.id)
  @JoinColumn({
    name: 'property_id',
  })
  property: Properties;

  @ManyToOne(() => Amenities, (amenities) => amenities.id)
  @JoinColumn({
    name: 'amenity_id',
  })
  amenity: Amenities;

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({
    name: 'created_by',
  })
  createdBy: Users;

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({
    name: 'updated_by',
  })
  updatedBy: Users;

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
