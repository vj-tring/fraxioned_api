import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PropertiesAmenities } from './property_amenities.entity';

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

  // @ManyToOne(() => Users, (user) => user.createdDeals, {
  //   onDelete: 'SET NULL',
  // })
  // @JoinColumn({
  //   name: 'created_by',
  // })
  createdBy: string;

  // @ManyToOne(() => Users, (user) => user.updatedDeals, {
  //   onDelete: 'SET NULL',
  // })
  // @JoinColumn({
  //   name: 'updated_by',
  // })
  updatedBy: string;

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

  @OneToOne(
    () => PropertiesAmenities,
    (propertiesAmenities) => propertiesAmenities.amenityId,
    {
      cascade: true,
    },
  )
  propertiesAmenities: PropertiesAmenities;
}
