import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('fxn_rule_constant')
export class RuleConstant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  name: string;

  @Column({
    name: 'value',
    type: 'int',
    nullable: true,
    default: null,
  })
  value: number;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  unit: string;

  @CreateDateColumn({ name: 'created_at', nullable: true, default: null })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true, default: null })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updatedBy: User;
}
