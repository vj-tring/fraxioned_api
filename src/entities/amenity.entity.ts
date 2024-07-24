import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('amenity')
@Unique(['id'])
export class Amenity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  type: string;
}
