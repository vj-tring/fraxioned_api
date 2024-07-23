import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
@Unique(['token'])
export class Sessions {
  @PrimaryGeneratedColumn()
  session_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: false })
  token: string;

  @Column({ type: 'timestamp', nullable: false })
  expires_at: Date;

  @Column({
    type: 'timestamp',
    precision: 6,
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;
}
