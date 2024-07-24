import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
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
  @UsePipes(ValidationPipe)
  inviteUser(@Body()inviteUserDto: InviteUserDto) {
    return this.authenticationService.inviteUser(inviteUserDto);
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  login(@Body() loginDto: LoginDto) {
    return this.authenticationService.login(loginDto);
  }
}
