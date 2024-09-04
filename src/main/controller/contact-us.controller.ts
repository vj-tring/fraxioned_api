import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ContactUsService } from '../service/contact-us.service';
import { ContactUsDto } from '../dto/requests/contact-us.dto';
import { ContactUsResponseDto } from '../dto/responses/contact-us.dto';

@ApiTags('Contact Us')
@Controller('v1/contact-us')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class ContactUsController {
  constructor(private contactUsService: ContactUsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async contactUs(
    @Body() contactUsDto: ContactUsDto,
  ): Promise<ContactUsResponseDto | object> {
    try {
      return await this.contactUsService.contactUs(contactUsDto);
    } catch (error) {
      return error;
    }
  }
}
