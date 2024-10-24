import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Property } from './property.entity';
import { Amenities } from './amenities.entity';
import { PropertySpace } from './property-space.entity';
import { BaseEntity } from '../commons/abstracts/base-entity';

@Entity('fxn_property_space_amenities')
export class PropertySpaceAmenities extends BaseEntity {
  @ManyToOne(() => Property, (properties) => properties.id)
  @JoinColumn({
    name: 'property_id',
  })
  property: Property;

  @ManyToOne(() => PropertySpace, (propertySpace) => propertySpace.id, {
    nullable: true,
  })
  @JoinColumn({
    name: 'property_space_id',
  })
  propertySpace?: PropertySpace;

  @ManyToOne(() => Amenities, (amenities) => amenities.id)
  @JoinColumn({
    name: 'amenity_id',
  })
  amenity: Amenities;
}
