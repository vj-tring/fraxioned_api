import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Property } from './property.entity';
import { BaseEntity } from '../commons/abstracts/base-entity';

@Entity('fxn_property_additional_image')
export class PropertyAdditionalImage extends BaseEntity {
  @Column({
    name: 'description',
    type: 'varchar',
    length: '1000',
    nullable: true,
  })
  description: string;

  @Column({ name: 'url', type: 'varchar', nullable: true })
  url: string;

  @Column({
    name: 'display_order',
    nullable: true,
  })
  displayOrder: number;

  @ManyToOne(() => Property, (property) => property.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'property_id', referencedColumnName: 'id' })
  property: Property;
}
