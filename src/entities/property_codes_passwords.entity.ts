import { Entity, Column, PrimaryGeneratedColumn, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Property } from './property.entity';

@Entity('property_codes_passwords')
export class PropertyCodesPasswords {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Property, {nullable: true})
  @JoinColumn({ name: 'property_id' })
  @Index()
  property: Property;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  home_technology: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  code_or_password: string;
}
