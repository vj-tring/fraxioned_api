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
import { Amenities } from './amenities.entity';
import { Property } from './property.entity';
import { PropertySpace } from './property-space.entity';
import { SpaceBathroomTypes } from './space-bathroom-types.entity';
import { SpaceBedType } from './space-bed-type.entity';
import { Space } from './space.entity';

@Entity('fxn_media_image')
export class MediaImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'url', type: 'varchar' })
  url: string;

  @Column({
    name: 'display_order',
    nullable: true,
  })
  displayOrder: number;

  @ManyToOne(() => Amenities, (amenities) => amenities.id, { nullable: true })
  @JoinColumn({ name: 'amenities_id', referencedColumnName: 'id' })
  amenities: Amenities;

  @ManyToOne(() => Property, (property) => property.id, { nullable: true })
  @JoinColumn({ name: 'property_id', referencedColumnName: 'id' })
  property: Property;

  @ManyToOne(() => PropertySpace, (propertySpace) => propertySpace.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'property_space_id', referencedColumnName: 'id' })
  propertySpace: PropertySpace;

  @ManyToOne(
    () => SpaceBathroomTypes,
    (spaceBathroomTypes) => spaceBathroomTypes.id,
    { nullable: true },
  )
  @JoinColumn({ name: 'space_bathroom_types_id', referencedColumnName: 'id' })
  spaceBathroomType: SpaceBathroomTypes;

  @ManyToOne(() => SpaceBedType, (spaceBedType) => spaceBedType.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'space_bed_type_id', referencedColumnName: 'id' })
  spaceBedType: SpaceBedType;

  @ManyToOne(() => Space, (space) => space.id, { nullable: true })
  @JoinColumn({ name: 'space_id', referencedColumnName: 'id' })
  space: Space;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ name: 'mail_banner', nullable: true })
  mailBanner: boolean;

  @Column({ name: 'cover_picture', nullable: true })
  coverPicture: boolean;

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
