import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';

@Injectable()
export class UserContactRepository {
  constructor(
    @InjectRepository(UserContactDetails)
    private readonly repository: Repository<UserContactDetails>,
  ) {}

  async findOneByEmail(email: string): Promise<UserContactDetails | undefined> {
    return this.repository.findOne({ where: { primaryEmail: email } });
  }

  create(contactData: Partial<UserContactDetails>): UserContactDetails {
    return this.repository.create(contactData);
  }

  async save(contact: UserContactDetails): Promise<UserContactDetails> {
    return this.repository.save(contact);
  }
}
