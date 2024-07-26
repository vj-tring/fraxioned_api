import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Properties } from './properties.entity';

@Entity('fx_property_codes')
export class PropertiesCodes {
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

  @Column({
    name: 'type',
    type: 'varchar',
  })
  propertyCodeType: string;

  @Column({
    name: 'type',
    type: 'varchar',
  })
  propertyCode: string;
}
