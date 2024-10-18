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

@Entity('fxn_properties')
export class Property {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @Column({
    name: 'ownerRez_prop_id',
    nullable: true,
  })
  ownerRezPropId: number;

  @Column({
    name: 'property_name',
    type: 'varchar',
  })
  propertyName: string;

  @Column({
    name: 'address',
    type: 'varchar',
  })
  address: string;

  @Column({
    name: 'city',
    type: 'varchar',
  })
  city: string;

  @Column({
    name: 'state',
    type: 'varchar',
  })
  state: string;

  @Column({
    name: 'country',
    type: 'varchar',
  })
  country: string;

  @Column({
    name: 'zipcode',
    type: 'integer',
  })
  zipcode: number;

  @Column({
    name: 'house_description',
    type: 'varchar',
    length: 1000,
  })
  houseDescription: string;

  @Column({
    name: 'is_exclusive',
    type: 'boolean',
  })
  isExclusive: boolean;

  @Column({
    name: 'property_share',
    type: 'integer',
  })
  propertyShare: number;

  @Column({
    name: 'property_remaining_share',
    type: 'integer',
    default: 0,
  })
  propertyRemainingShare: number;

  @Column({
    name: 'latitude',
    type: 'double',
    precision: 10,
    scale: 6,
  })
  latitude: number;

  @Column({
    name: 'longitude',
    type: 'double',
    precision: 10,
    scale: 6,
  })
  longitude: number;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    name: 'display_order',
    nullable: true,
  })
  displayOrder: number;

  @Column({
    name: 'mail_banner_url',
    type: 'varchar',
    nullable: true,
  })
  mailBannerUrl: string;

  @Column({
    name: 'cover_image_url',
    type: 'varchar',
    nullable: true,
  })
  coverImageUrl: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'created_by',
  })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'updated_by',
  })
  updatedBy: User;

  @CreateDateColumn({
    name: 'created_at',
    nullable: true,
  })
  createdAt: Date = undefined;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
  })
  updatedAt: Date = undefined;
}
