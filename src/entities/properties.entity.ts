import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  // Unique,
  // ManyToOne,
  // JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { PropertiesDetails } from './properties_details.entity';
import { PropertiesImages } from './properties_images.entity';
import { PropertiesSeasonHolidays } from './properties_season_holidays.entity';
import { PropertiesAmenities } from './property_amenities.entity';
import { PropertiesCodes } from './property_codes.entity';

@Entity('fx_properties')
export class Properties {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

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
    name: 'map_coordinates',
    type: 'point',
  })
  mapCoordinates: string;

  // @ManyToOne(() => Users, (user) => user.createdDeals, {
  //   onDelete: 'SET NULL',
  // })
  // @JoinColumn({
  //   name: 'created_by',
  // })
  createdBy: string;

  // @ManyToOne(() => Users, (user) => user.updatedDeals, {
  //   onDelete: 'SET NULL',
  // })
  // @JoinColumn({
  //   name: 'updated_by',
  // })
  updatedBy: string;

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

  @OneToOne(
    () => PropertiesDetails,
    (propertiesDeatils) => propertiesDeatils.propertyId,
    {
      cascade: true,
    },
  )
  propertyDeatils: PropertiesDetails;

  @OneToOne(
    () => PropertiesImages,
    (propertiesImages) => propertiesImages.propertyId,
    {
      cascade: true,
    },
  )
  propertiesImages: PropertiesImages;

  @OneToOne(
    () => PropertiesSeasonHolidays,
    (propertiesSeasonHolidays) => propertiesSeasonHolidays.propertyId,
    {
      cascade: true,
    },
  )
  propertiesSeasonHolidays: PropertiesSeasonHolidays;

  @OneToOne(
    () => PropertiesAmenities,
    (propertiesAmenities) => propertiesAmenities.propertyId,
    {
      cascade: true,
    },
  )
  propertiesAmenities: PropertiesAmenities;

  @OneToOne(
    () => PropertiesCodes,
    (propertiesCodes) => propertiesCodes.propertyId,
    {
      cascade: true,
    },
  )
  propertiesCodes: PropertiesCodes;
}
