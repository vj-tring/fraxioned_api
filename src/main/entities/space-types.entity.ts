import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Space } from './space.entity';

@Entity('fxn_space_types')
export class SpaceTypes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => Space, (space) => space.spaceTypes)
  @JoinColumn({ name: 'space_id' })
  space: Space;
}
