import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Property } from './property.entity';

@Entity()
export class PropertyShareCount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  share_type: string;

  @OneToMany(() => Property, (property) => property.share)
  properties: Property[];
}
