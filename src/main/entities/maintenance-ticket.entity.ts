import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('fxn_maintenance_ticket')
export class MaintenanceTicket {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @Column({
    name: 'ticket_subject',
    type: 'varchar',
  })
  ticketSubject: string;

  @Column({
    name: 'ticket_description',
    type: 'varchar',
  })
  ticketDescription: string;

  @Column({
    name: 'ticket_status',
    type: 'varchar',
    default: 'open',
  })
  ticketStatus: string;

  @Column({
    name: 'ticket_priority',
    type: 'varchar',
    default: 'normal',
  })
  ticketPriority: string;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'created_by',
  })
  createdBy: number;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'updated_by',
  })
  updatedBy: number;

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
