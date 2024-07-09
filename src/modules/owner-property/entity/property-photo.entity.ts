import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Property } from './property.entity';

@Entity()
export class PropertyPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  image_url: string;

  @ManyToOne(() => Property, (property) => property.photos)
  @JoinColumn({ name: 'property_id' })
  property: Property;
}
