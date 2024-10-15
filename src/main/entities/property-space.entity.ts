import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Space } from './space.entity';
import { User } from './user.entity';
import { Property } from './property.entity';

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
}
