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
import { PropertySpace } from './property-space.entity';

@Entity('fxn_property_space_image')
export class PropertySpaceImage {
  @PrimaryGeneratedColumn()
  id: number;

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

  @ManyToOne(() => PropertySpace, (propertySpace) => propertySpace.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'property_space_id', referencedColumnName: 'id' })
  propertySpace: PropertySpace;

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
