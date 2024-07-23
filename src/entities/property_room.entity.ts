import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Property } from './property.entity';

@Entity('property_room')
export class PropertyRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Property, { nullable: false })
  @JoinColumn({ name: 'property_id' })
  @Index()
  property: Property;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'int', nullable: true, default: null })
  description: number;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  image_url: string;
}