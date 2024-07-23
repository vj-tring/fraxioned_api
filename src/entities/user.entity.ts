import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, default: '' })
  first_name: string;

  @Column({ type: 'varchar', length: 255, nullable: false, default: '' })
  last_name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  image_url: string;

  @Column({ type: 'tinyint', nullable: false, default: 1 })
  is_active: number;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '' })
  reset_token: string;

  @Column({ type: 'timestamp', nullable: true, default: null })
  reset_token_expires: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  last_login_time: Date;

  @Column({ type: 'int', nullable: true, default: null })
  created_by: number;

  @Column({
    type: 'timestamp',
    precision: 6,
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @Column({ type: 'int', nullable: true, default: null })
  updated_by: number;

  @Column({
    type: 'timestamp',
    precision: 6,
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
