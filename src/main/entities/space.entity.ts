import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { SpaceTypes } from './space-types.entity';

@Entity('fxn_space')
export class Space {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => SpaceTypes, (spaceType) => spaceType.space)
  spaceTypes: SpaceTypes[];
}
