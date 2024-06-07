import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'username', default: '' })
  username: string;

  @Column({ name: 'phone', default: '' })
  phone: string;

  @Column({ name: 'seconday_phone', nullable: true })
  secondaryPhone: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'secondary_email', nullable: true })
  secondaryEmail: string;

  @Column({ name: 'address1' })
  address1: string;

  @Column({ name: 'address2', nullable: true })
  address2: string;

  @Column({ name: 'state' })
  state: string;

  @Column({ name: 'city' })
  city: string;

  @Column({ name: 'zip' })
  zip: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'is_active', default: true }) 
  isActive: boolean;

  @Column({ name: 'reset_token', default:'' })
  resetToken: string;

  @Column({ name: 'reset_token_expires', default:'' })
  resetTokenExpires: Date;

  @Column({ name: 'last_login_time', type: 'timestamp', nullable: true })
  lastLoginTime: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'updated_by', default:'' })
  updatedBy: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

}
