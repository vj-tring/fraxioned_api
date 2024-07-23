import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('rental_type')
@Unique(['id'])
export class RentalType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  type: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  description: string;
}