import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Space } from './space.entity';
import { User } from './user.entity';
import { Property } from './property.entity';
import { PropertySpaceImage } from './property-space-image.entity';
import { PropertySpaceBed } from './property-space-bed.entity';
import { PropertySpaceBathroom } from './property-space-bathroom.entity';
import { PropertySpaceAmenities } from './property-space-amenity.entity';

@Entity('fxn_property_space')
export class PropertySpace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'instance_number',
    type: 'int',
    nullable: true,
    default: null,
  })
  instanceNumber: number;

  @ManyToOne(() => Space, (space) => space.id)
  @JoinColumn({ name: 'space_id', referencedColumnName: 'id' })
  space: Space;

  @ManyToOne(() => Property, (property) => property.id)
  @JoinColumn({ name: 'property_id', referencedColumnName: 'id' })
  property: Property;

  @CreateDateColumn({ name: 'created_at', nullable: true, default: null })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true, default: null })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updatedBy: User;

  @OneToMany(() => PropertySpaceImage, (image) => image.propertySpace)
  propertySpaceImages: PropertySpaceImage[];

  @OneToMany(() => PropertySpaceBed, (spaceBed) => spaceBed.propertySpace)
  propertySpaceBeds: PropertySpaceBed[];

  @OneToMany(
    () => PropertySpaceBathroom,
    (spaceBathroom) => spaceBathroom.propertySpace,
  )
  propertySpaceBathrooms: PropertySpaceBathroom[];

  @OneToMany(
    () => PropertySpaceAmenities,
    (propertySpaceAmenity) => propertySpaceAmenity.propertySpace,
  )
  propertySpaceAmenities: PropertySpaceAmenities[];
}
