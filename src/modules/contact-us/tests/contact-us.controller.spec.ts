import { Test, TestingModule } from '@nestjs/testing';
import { ContactUsController } from '../contact-us.controller';
import { ContactUsService } from '../contact-us.service';
import { ContactUsDTO } from '../contact-us.dto';

class MockContactUsService {
  handleContactUs = jest.fn().mockResolvedValue({ message: 'Contact message sent successfully' });
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
    contactUsService = module.get<ContactUsService>(ContactUsService); // Ensure correct service token here
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('contactUs', () => {
    it('should call the handleContactUs method of ContactUsService with correct arguments', async () => {
      // Arrange
      const contactUsDTO: ContactUsDTO = {
        userId: 1,
        name: "john",
        subject: "error",
        message: "error while booking"
      };

      // Act
      await controller.contactUs(contactUsDTO);

      // Assert
      expect(contactUsService.handleContactUs).toHaveBeenCalledWith(
        contactUsDTO,
      );
    });

    it('should return the result from ContactUsService', async () => {
      // Arrange
      const contactUsDTO: ContactUsDTO = {
        userId: 1,
        name: "john",
        subject: "error",
        message: "error while booking"
      };
      const expectedResult = { message: 'Contact message sent successfully' };

      // Act
      const result = await controller.contactUs(contactUsDTO);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });
});
