import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity('fxn_amenities')
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
