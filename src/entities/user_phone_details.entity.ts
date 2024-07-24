import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_phone_details')
export class UserPhoneDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @Column({ type: 'varchar', length: 50, nullable: true, default: null })
  phone_number: string;
}
