import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Properties } from './properties.entity';

@Entity('fx_property_images')
export class PropertiesImages {
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
    name: 'url',
    type: 'varchar',
  })
  imageUrl: string;

  @Column({
    name: 'type',
    type: 'varchar',
  })
  imageType: string;

  @Column({
    name: 'name',
    type: 'varchar',
  })
  imageName: string;

  @Column({
    name: 'description',
    type: 'varchar',
  })
  imageDescription: string;
}
