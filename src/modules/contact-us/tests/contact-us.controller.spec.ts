import { Test, TestingModule } from '@nestjs/testing';
import { ContactUsController } from '@contactUs/contact-us.controller';
import { ContactUsService } from '@contactUs/contact-us.service';
import { ContactUsDTO } from '@contactUs/contact-us.dto';

class MockContactUsService {
  handleContactUs = jest
    .fn()
    .mockResolvedValue({ message: 'Contact message sent successfully' });
}

describe('ContactUsController', () => {
  let controller: ContactUsController;
  let contactUsService: ContactUsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactUsController],
      providers: [
        {
          provide: ContactUsService,
          useClass: MockContactUsService,
        },
      ],
    }).compile();

    controller = module.get<ContactUsController>(ContactUsController);
    contactUsService = module.get<ContactUsService>(ContactUsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('contactUs', () => {
    it('should call the handleContactUs method of ContactUsService with correct arguments', async () => {
      const contactUsDTO: ContactUsDTO = {
        userId: 1,
        name: 'john',
        subject: 'error',
        message: 'error while booking',
      };

      await controller.contactUs(contactUsDTO);

      expect(contactUsService.handleContactUs).toHaveBeenCalledWith(
        contactUsDTO,
      );
    });

    it('should return the result from ContactUsService', async () => {
      const contactUsDTO: ContactUsDTO = {
        userId: 1,
        name: 'john',
        subject: 'error',
        message: 'error while booking',
      };
      const expectedResult = { message: 'Contact message sent successfully' };

      const result = await controller.contactUs(contactUsDTO);

      expect(result).toEqual(expectedResult);
    });
  });
});
