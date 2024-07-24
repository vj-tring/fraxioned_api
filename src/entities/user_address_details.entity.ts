import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_address_details')
export class UserAddressDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  address_line_1: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  address_line_2: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  state: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  city: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  zip: string;
}
