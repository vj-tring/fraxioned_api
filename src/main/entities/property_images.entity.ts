import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './property.entity';
import { User } from './user.entity';
import { SpaceTypes } from './space-types.entity';

@Entity('fxn_property_images')
export class PropertyImages {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @Column({
    name: 'url',
    type: 'varchar',
  })
  imageUrl: string;

  @Column({
    name: 'name',
    type: 'varchar',
  })
  imageName: string;

  @Column({
    name: 'display_order',
    nullable: true,
  })
  displayOrder: number;

  @ManyToOne(() => SpaceTypes, (spaceTypes) => spaceTypes.id)
  @JoinColumn({
    name: 'space_type_id',
  })
  spaceType: SpaceTypes;

  @ManyToOne(() => Property, (properties) => properties.id)
  @JoinColumn({
    name: 'property_id',
  })
  property: Property;

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
