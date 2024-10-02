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

@Entity('fxn_user_property_document')
export class UserPropertyDocument {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @Column({
    name: 'url',
    type: 'varchar',
  })
  documentUrl: string;

  @Column({
    name: 'name',
    type: 'varchar',
  })
  documentName: string;

  @Column({
    name: 'document_type',
    type: 'varchar',
  })
  documentType: string;

  @ManyToOne(() => Property, (properties) => properties.id)
  @JoinColumn({
    name: 'property_id',
  })
  property: Property;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

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
