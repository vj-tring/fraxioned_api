import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('property_codes_passwords')
export class PropertyCodesPasswords {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true, default: null })
  property_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  home_technology: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  code_or_password: string;
}