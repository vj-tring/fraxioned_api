import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('owner_documents')
export class OwnerDocuments {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  document_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  document_url: string;
}
