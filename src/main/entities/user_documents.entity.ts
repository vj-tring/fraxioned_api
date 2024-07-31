import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Properties } from './properties.entity';

@Entity('fxn_user_documents')
export class UserDocuments {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Properties, (property) => property.id)
  @JoinColumn({ name: 'property_id', referencedColumnName: 'id' })
  property: Properties;

  @Column({
    name: 'document_name',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  documentName: string;

  @Column({
    name: 'document_url',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  documentURL: string;

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
