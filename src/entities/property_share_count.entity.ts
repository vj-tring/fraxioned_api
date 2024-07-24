import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('property_share_count')
export class PropertyShareCount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  share_type: number;
}
