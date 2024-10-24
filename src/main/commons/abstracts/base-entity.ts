import {
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../entities/user.entity';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'created_by',
    referencedColumnName: 'id',
  })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'updated_by',
    referencedColumnName: 'id',
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
