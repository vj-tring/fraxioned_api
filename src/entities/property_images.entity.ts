import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Property } from './property.entity';

@Entity('property_images')
export class PropertyImages {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  @Index()
  property: Property;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  image_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  property_3d_tour: string;
}