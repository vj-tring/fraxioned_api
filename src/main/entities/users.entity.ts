import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('fxn_users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Role, (role) => role.id)
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: Role;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 255,
    nullable: false,
    default: '',
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 255,
    nullable: false,
    default: '',
  })
  lastName: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({
    name: 'image_url',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  imageURL: string;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    nullable: false,
    default: true,
  })
  isActive: boolean;

  @Column({
    name: 'address_line_1',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  addressLine1: string;

  @Column({
    name: 'address_line_2',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  addressLine2: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  state: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  country: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  city: string;

  @Column({ type: 'int', nullable: true, default: null })
  zipcode: string;

  @Column({
    name: 'reset_token',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: '',
  })
  resetToken: string;

  @Column({
    name: 'reset_token_expires',
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  resetTokenExpires: Date;

  @Column({
    name: 'last_login_time',
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  lastLoginTime: Date;

  @Column({
    name: 'created_by',
    type: 'int',
    nullable: true,
    default: null,
  })
  createdBy: number;

  @Column({
    name: 'updated_by',
    type: 'int',
    nullable: true,
    default: null,
  })
  updatedBy: number;

  @CreateDateColumn({ name: 'created_at', nullable: true, default: null })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true, default: null })
  updatedAt: Date;
}
