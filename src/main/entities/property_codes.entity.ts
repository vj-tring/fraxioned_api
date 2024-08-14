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

@Entity('fxn_property_codes')
export class PropertyCodes {
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

  @Column({
    name: 'type',
    type: 'varchar',
  })
  propertyCodeType: string;

  @Column({
    name: 'code',
    type: 'varchar',
  })
  propertyCode: string;

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
