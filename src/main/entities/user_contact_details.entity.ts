import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity('fxn_user_contact_details')
export class UserContactDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Users;

  @Column({
    name: 'contact_type',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  contactType: string;

  @Column({
    name: 'contact_value',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  contactValue: string;

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
