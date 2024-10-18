import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { FaqCategory } from './faq-category.entity';
import { User } from './user.entity';

@Entity('fxn_faq_questions')
export class FaqQuestions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ type: 'int' })
  categoryId: number;

  @ManyToOne(() => FaqCategory, (faqCategory) => faqCategory.questions)
  @JoinColumn({ name: 'categoryId', referencedColumnName: 'id' })
  category: FaqCategory;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updatedBy: User;
}
