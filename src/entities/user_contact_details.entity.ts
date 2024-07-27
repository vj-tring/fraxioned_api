import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('fxn_user_contact_details')
export class UserContactDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({
    name: 'contact_type',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  contactType: string;

  @Column({
    name: 'contact_value',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  contactValue: string;
}
