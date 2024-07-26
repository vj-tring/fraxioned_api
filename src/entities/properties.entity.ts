import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity('fx_properties')
export class Properties {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @Column({
    name: 'property_name',
    type: 'varchar',
  })
  propertyName: string;

  @Column({
    name: 'address',
    type: 'varchar',
  })
  address: string;

  @Column({
    name: 'city',
    type: 'varchar',
  })
  city: string;

  @Column({
    name: 'state',
    type: 'varchar',
  })
  state: string;

  @Column({
    name: 'country',
    type: 'varchar',
  })
  country: string;

  @Column({
    name: 'zipcode',
    type: 'integer',
  })
  zipcode: number;

  @Column({
    name: 'house_description',
    type: 'varchar',
    length: 1000,
  })
  houseDescription: string;

  @Column({
    name: 'is_exclusive',
    type: 'boolean',
  })
  isExclusive: boolean;

  @Column({
    name: 'property_share',
    type: 'integer',
  })
  propertyShare: number;

  @Column({
    name: 'map_coordinates',
    type: 'point',
  })
  mapCoordinates: string;

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
