import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { AuthenticationService } from '../../service/Authentication/authentication.service';
import { InviteUserDto } from '../../dto/Authentication/invite-user.dto';
import { LoginDto } from '../../dto/Authentication/login.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('api/authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('invite')
  inviteUser(@Body() inviteUserDto: InviteUserDto) {
    return this.authenticationService.inviteUser(inviteUserDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authenticationService.login(loginDto);
  }
}
