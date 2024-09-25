import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  // OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
// import { PropertyCodes } from './property_codes.entity';

@Entity('fxn_property_code_category')
export class PropertyCodeCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

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

  // @OneToMany(() => PropertyCodes, (propertyCode) => propertyCode.propertyCodeCategory)
  // propertyCodes: PropertyCodes[];
}
