import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('season')
@Unique(['id'])
export class Season {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;
}