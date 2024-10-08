import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../commons/abstracts/base-entity';
import { PropertySpace } from './property-space.entity';
import { SpaceBathroomTypes } from './space-bathroom-types.entity';

@Entity('fxn_property_space_bathroom')
export class PropertySpaceBathroom extends BaseEntity {
  @ManyToOne(
    () => SpaceBathroomTypes,
    (spaceBathroomTypes) => spaceBathroomTypes.id,
    { onDelete: 'SET NULL' },
  )
  @JoinColumn({
    name: 'space_bathroom_types_id',
  })
  spaceBathroomType: SpaceBathroomTypes;

  @ManyToOne(() => PropertySpace, (propertySpace) => propertySpace.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'space_instance_id',
  })
  propertySpace: PropertySpace;

  @Column({
    name: 'count',
    type: 'integer',
  })
  count: number;
}
