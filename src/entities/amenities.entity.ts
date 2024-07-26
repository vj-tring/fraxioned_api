import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fxn_amenities')
export class Amenities {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: 'This is a unique identifier',
  })
  id: number;

  @Column({
    name: 'name',
    type: 'varchar',
  })
  amenityName: string;

  @Column({
    name: 'description',
    type: 'varchar',
  })
  amenityDescription: string;

  @Column({
    name: 'type',
    type: 'varchar',
  })
  amenityType: string;
}
