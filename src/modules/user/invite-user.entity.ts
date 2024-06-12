import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Role } from '@user-role/role/role.entity';

@Entity({ name: 'invite_user' })
export class InviteUser {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'invite_token' })
  inviteToken: string;

  @Column({ name: 'invite_token_expires', type: 'timestamp' })
  inviteTokenExpires: Date;

  @Column({ name: 'invited_by' })
  invitedBy: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => Role, (role) => role.id)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
