import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Properties } from './properties.entity';
import { Amenities } from './amenities.entity';

@Entity('fx_property_amenities')
export class PropertiesAmenities {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @OneToOne(() => Properties, (properties) => properties.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'property_id',
  })
  propertyId: Properties;

  @OneToOne(() => Amenities, (amenities) => amenities.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'amenity_id',
  })
  amenityId: Amenities;
}
