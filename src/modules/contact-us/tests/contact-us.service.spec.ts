import { Test, TestingModule } from '@nestjs/testing';
import { ContactUsService } from '../contact-us.service';
import { MailService } from '../../mail/mail.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import { ContactUsDTO } from '../contact-us.dto';

describe('ContactUsService', () => {
  let service: ContactUsService;
  let mailService: MailService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactUsService,
        {
          provide: MailService,
          useValue: { sendMail: jest.fn() },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ContactUsService>(ContactUsService);
    mailService = module.get<MailService>(MailService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should send an email with the contact message', async () => {
    const contactUsDTO: ContactUsDTO = {
      userId: 1,
      name: 'John Doe',
      subject: 'Test Subject',
      message: 'Test Message',
    };

    const user = {
      id: 1,
      email: 'john.doe@example.com',
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as User);

    const result = await service.handleContactUs(contactUsDTO);

    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: contactUsDTO.userId } });
    expect(mailService.sendMail).toHaveBeenCalledWith(
      'johnson.selvakumar@tringapps.net',
      contactUsDTO.subject,
      `Name: ${contactUsDTO.name}\nEmail: ${user.email}\nMessage: ${contactUsDTO.message}`
    );
    expect(result).toEqual({ message: 'Contact message sent successfully' });
  });

  it('should throw an error if the user is not found', async () => {
    const contactUsDTO: ContactUsDTO = {
      userId: 1,
      name: 'John Doe',
      subject: 'Test Subject',
      message: 'Test Message',
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

    await expect(service.handleContactUs(contactUsDTO)).rejects.toThrow('User not found');
  });
});
