import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ name: 'username', default: '' })
  username: string;

  @Column({ name: 'phone', default: '' })
  phone: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'isActive', default: true })
  isActive: boolean;

  @Column({ name: 'current_session_id', nullable: true })
  currentSessionId: string;

  @Column({ name: 'reset_token', nullable: true })
  resetToken: string;

  @Column({ name: 'invite_token', nullable: true })
  inviteToken: string;

  @Column({ name: 'last_login_time', type: 'timestamp', nullable: true })
  lastLoginTime: Date;

  @UpdateDateColumn({ name: 'last_updated', type: 'timestamp' })
  lastUpdated: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
