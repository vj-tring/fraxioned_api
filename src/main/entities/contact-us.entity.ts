import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../commons/abstracts/base-entity';

@Entity('fxn_contact_us')
export class ContactUs extends BaseEntity {
  @Column({
    name: 'subject',
    type: 'varchar',
  })
  subject: string;

  @Column({
    name: 'comments',
    type: 'varchar',
  })
  comments: string;
}
