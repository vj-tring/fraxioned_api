import { Column, Entity } from 'typeorm';
import { CountValue } from '../commons/constants/enumerations/space-bathroom-types.enum';
import { BaseEntity } from '../commons/abstracts/base-entity';

@Entity('fxn_space_bathroom_types')
export class SpaceBathroomTypes extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    default: 'full',
    nullable: false,
  })
  name: string;

  @Column({
    name: 'count_value',
    type: 'enum',
    enum: CountValue,
    default: CountValue.ONE,
    nullable: false,
  })
  countValue: CountValue;

  @Column({
    name: 's3_image_url',
    type: 'varchar',
    length: 500,
    default: null,
    nullable: true,
  })
  s3_url: string;
}
