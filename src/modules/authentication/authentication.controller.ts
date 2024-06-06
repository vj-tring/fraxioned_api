import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { InviteDTO } from './dto/invite.dto';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('api/authentication')
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

  @Post('login')
  async login(@Body() loginDTO: LoginDTO) {
    const result = await this.authenticationService.login(loginDTO);
    return result;
  }


  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDTO: ForgotPasswordDTO) {
    await this.authenticationService.forgotPassword(forgotPasswordDTO);
    return { message: 'Password reset email sent successfully' };
  }

  @Post('reset-password')
  async resetPassword(
    @Headers('resetToken') resetToken: string,
    @Body() resetPasswordDTO: ResetPasswordDTO,
  ) {
    const result = await this.authenticationService.resetPassword(
      resetToken,
      resetPasswordDTO,
    );
    return result;
  }

  @Post('logout')
  async logout(@Headers('Authorization') token: string) {
    const result = await this.authenticationService.logout(token);
    return result;
  }
}
