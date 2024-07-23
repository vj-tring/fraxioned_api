import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Property } from './property.entity';
import { Amenity } from './amenity.entity';

@Entity('property_amenities')
export class PropertyAmenities {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  @Index()
  property: Property;

  @ManyToOne(() => Amenity)
  @JoinColumn({ name: 'amenity_id' })
  @Index()
  amenity: Amenity;
}