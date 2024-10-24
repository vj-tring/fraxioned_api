import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../commons/abstracts/base-entity';

@Entity('fxn_space')
export class Space extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true, default: null })
  s3_url: string;

  @Column({
    name: 'is_bed_type_allowed',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isBedTypeAllowed: boolean;

  @Column({
    name: 'is_bathroom_type_allowed',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isBathroomTypeAllowed: boolean;
}
