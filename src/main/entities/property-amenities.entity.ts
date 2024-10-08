import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Property } from './property.entity';
import { Amenities } from './amenities.entity';
import { BaseEntity } from '../commons/abstracts/base-entity';
import { PropertySpace } from './property-space.entity';

@Entity('fxn_property_amenities')
export class PropertyAmenities extends BaseEntity {
  @ManyToOne(() => Property, (properties) => properties.id)
  @JoinColumn({
    name: 'property_id',
  })
  property: Property;

  @ManyToOne(() => Amenities, (amenities) => amenities.id)
  @JoinColumn({
    name: 'amenity_id',
  })
  amenity: Amenities;

  @ManyToOne(() => PropertySpace, (propertySpace) => propertySpace.id, {
    nullable: true,
  })
  @JoinColumn({
    name: 'property_space_id',
  })
  propertySpace?: PropertySpace;
}
