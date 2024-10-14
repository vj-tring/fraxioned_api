import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../commons/abstracts/base-entity';

@Entity('fxn_space_bed_types')
export class SpaceBedType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'bed_type', type: 'varchar', length: 255 })
  bedType: string;

  @Column({
    name: 's3_image_url',
    type: 'varchar',
    length: 500,
    default: null,
    nullable: true,
  })
  s3_url: string;
}
