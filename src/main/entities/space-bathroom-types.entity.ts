import { Column, Entity } from 'typeorm';
import {
  BathroomType,
  CountValue,
} from '../commons/constants/enumerations/space-bathroom-types.enum';
import { BaseEntity } from '../commons/abstracts/base-entity';

@Entity('fxn_space_bathroom_types')
export class SpaceBathroomTypes extends BaseEntity {
  @Column({
    name: 'name',
    type: 'enum',
    enum: BathroomType,
    default: BathroomType.FULL,
    nullable: false,
  })
  name: BathroomType;

  @Column({
    name: 'count_value',
    type: 'enum',
    enum: CountValue,
    default: CountValue.ONE,
    nullable: false,
  })
  countValue: CountValue;
}
