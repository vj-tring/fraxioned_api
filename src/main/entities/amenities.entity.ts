import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AmenityGroup } from './amenity-group.entity';
import { BaseEntity } from '../commons/abstracts/base-entity';

@Entity('fxn_amenities')
export class Amenities extends BaseEntity {
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
    nullable: true,
    default: null,
  })
  amenityDescription: string;

  @ManyToOne(() => AmenityGroup, (amenityGroup) => amenityGroup.amenities)
  @JoinColumn({ name: 'amenity_group_id' })
  amenityGroup: AmenityGroup;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    default: null,
  })
  s3_url: string;
}
