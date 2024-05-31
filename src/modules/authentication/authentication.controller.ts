import { Controller, Post, Body } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { InviteDTO } from './dto/invite.dto';
import { RegisterDTO } from './dto/register.dto';


@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('invite')
  async sendInvite(@Body() inviteDTO: InviteDTO) {
    await this.authenticationService.sendInvite(inviteDTO);
    return { message: 'Invitation sent successfully' };
  }

  @Post('register')
  async register(@Body() registerDTO: RegisterDTO) {
    const result = await this.authenticationService.register(registerDTO);
    return result;
  }
}

