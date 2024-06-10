import { Test, TestingModule } from '@nestjs/testing';
import { ContactUsService } from '../contact-us.service';
import { MailService } from '../../mail/mail.service';

class MockMailService {
  async sendMail() {
    return true;
  }
}

describe('ContactUsService', () => {
  let service: ContactUsService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactUsService,
        {
          provide: MailService,
          useClass: MockMailService,
        },
      ],
    }).compile();

    service = module.get<ContactUsService>(ContactUsService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleContactUs', () => {
    it('should send an email with the contact message', async () => {
      // Arrange
      const contactUsDTO = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message',
      };

      // Act
      const result = await service.handleContactUs(contactUsDTO);

      // Assert
      expect(result).toEqual({ message: 'Contact message sent successfully' });
      expect(mailService.sendMail).toHaveBeenCalledWith(
        'johnson.selvakumar@tringapps.net',
        'New Contact Us Message',
        'Name: John Doe\nEmail: john@example.com\nMessage: This is a test message',
      );
    });
  });
});
