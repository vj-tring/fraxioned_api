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
import { Property } from './property.entity';

@Entity('owner_property')
@Unique(['id'])
export class OwnerProperty {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  @Index()
  property: Property;

  @Column({ type: 'int', nullable: false, default: 0 })
  no_of_share: number;

  @Column({ type: 'date', nullable: false })
  acquisition_date: Date;

  @Column({ type: 'date', nullable: true, default: null })
  sale_date: Date;

  @Column({ type: 'tinyint', nullable: false, default: 1 })
  is_active: number;

  @Column({ type: 'int', nullable: false })
  created_by: number;

  @Column({ type: 'int', nullable: true, default: null })
  updated_by: number;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
