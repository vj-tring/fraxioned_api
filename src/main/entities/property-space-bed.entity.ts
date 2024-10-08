import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { SpaceBedType } from './space-bed-type.entity';
import { PropertySpace } from './property-space.entity';

@Entity('fxn_property_space_beds')
export class PropertySpaceBed {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PropertySpace, (propertySpace) => propertySpace.id)
  @JoinColumn({ name: 'property_space_id', referencedColumnName: 'id' })
  propertySpace: PropertySpace;

  @ManyToOne(() => SpaceBedType, (spaceBedType) => spaceBedType.id)
  @JoinColumn({ name: 'space_bed_type_id', referencedColumnName: 'id' })
  spaceBedType: SpaceBedType;

  @Column({ name: 'count', type: 'int' })
  count: number;

  @CreateDateColumn({ name: 'created_at', nullable: true, default: null })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true, default: null })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updatedBy: User;
}
