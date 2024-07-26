import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Properties } from './properties.entity';
import { Amenities } from './amenities.entity';

@Entity('fx_property_amenities')
export class PropertiesAmenities {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @ManyToOne(() => Properties, (properties) => properties.id)
  @JoinColumn({
    name: 'property_id',
  })
  property: Properties;

  @ManyToOne(() => Amenities, (amenities) => amenities.id)
  @JoinColumn({
    name: 'amenity_id',
  })
  amenity: Amenities;
}
