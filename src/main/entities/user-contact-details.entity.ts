import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
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
    name: 'primary_email',
    type: 'varchar',
    nullable: false,
  })
  primaryEmail: string;

  @Column({
    name: 'secondary_email',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  secondaryEmail: string;

  @Column({
    name: 'optional_email_1',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  optionalEmailOne: string;

  @Column({
    name: 'optional_email_2',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  optionalEmailTwo: string;

  @Column({
    name: 'primary_phone',
    type: 'varchar',
    nullable: false,
  })
  primaryPhone: string;

  @Column({
    name: 'secondary_phone',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  secondaryPhone: string;

  @Column({
    name: 'optional_phone_1',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  optionalPhoneOne: string;

  @Column({
    name: 'optional_phone_2',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  optionalPhoneTwo: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'created_by',
  })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'updated_by',
  })
  updatedBy: User;

  @CreateDateColumn({
    name: 'created_at',
    nullable: true,
  })
  createdAt: Date = undefined;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
  })
  updatedAt: Date = undefined;
}
