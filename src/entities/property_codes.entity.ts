import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
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

  @OneToOne(() => Properties, (properties) => properties.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'property_id',
  })
  propertyId: Properties;

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
