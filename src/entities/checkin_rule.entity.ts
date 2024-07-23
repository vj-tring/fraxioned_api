import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('checkin_rule')
export class CheckinRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true, default: null })
  max_days_for_check_in: number;
}