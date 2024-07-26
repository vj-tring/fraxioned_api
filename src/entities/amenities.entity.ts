import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PropertiesAmenities } from './property_amenities.entity';
import { Users } from './users.entity';

@Entity('fx_amenities')
export class Amenities {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @Column({
    name: 'name',
    type: 'varchar',
  })
  amenityName: string;

  @Column({
    name: 'description',
    type: 'varchar',
  })
  amenityDescription: string;

  @Column({
    name: 'type',
    type: 'varchar',
  })
  amenityType: string;

}
