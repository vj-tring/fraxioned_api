import { Controller, Post, Body } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsDTO } from './contact-us.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Contact Us')
@Controller('api/contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  async contactUs(@Body() contactUsDTO: ContactUsDTO) {
    const result = await this.contactUsService.handleContactUs(contactUsDTO);
    return result;
  }
}
