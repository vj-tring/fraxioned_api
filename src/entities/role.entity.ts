import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('role')
@Unique(['id'])
@Unique(['role_name'])
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  role_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  description: string;

  @Column({ type: 'int', nullable: false })
  created_by: number;

  @Column({ type: 'timestamp', precision: 6, nullable: false, default: () => 'CURRENT_TIMESTAMP(6)' })
  created_at: Date;

  @Column({ type: 'int', nullable: true, default: null })
  updated_by: number;

  @Column({ type: 'timestamp', precision: 6, nullable: true, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updated_at: Date;
}