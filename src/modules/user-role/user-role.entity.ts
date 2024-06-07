import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { User } from '../user/user.entity';
  import { Role } from './role/role.entity';
  
  @Entity({ name: 'user_role' })
  export class UserRole {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;
  
    @Column({ name: 'user_id' })
    userId: number;
  
    @Column({ name: 'role_id' })
    roleId: number;
  
    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @ManyToOne(() => Role, role => role.id)
    @JoinColumn({ name: 'role_id' })
    role: Role;
  }
  