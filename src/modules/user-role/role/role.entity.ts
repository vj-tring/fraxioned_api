import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'role' })
export class Role {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'role_name', unique: true })
  roleName: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'created_by' })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
