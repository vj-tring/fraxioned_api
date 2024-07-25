import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthenticationService } from 'services/Authentication/authentication.service';
import { InviteUserDto } from 'dto/Authentication/invite-user.dto';
import { LoginDto } from 'dto/Authentication/login.dto';
import { ForgotPasswordDto } from 'dto/Authentication/forgot-password.dto';
import { ResetPasswordDto } from 'dto/Authentication/reset-password.dto';
import { ChangePasswordDto } from 'src/dto/Authentication/recover-password.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';

@ApiTags('Authentication')
@Controller('api/authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('invite')
  @UsePipes(ValidationPipe)
  inviteUser(
    @Body() inviteUserDto: InviteUserDto,
  ): Promise<{ message: string }> {
    return this.authenticationService.inviteUser(inviteUserDto);
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  login(@Body() loginDto: LoginDto): Promise<{
    message: string;
    user: Partial<User>;
    session: { token: string; expires_at: Date };
  }> {
    return this.authenticationService.login(loginDto);
  }

  @Post('forgotPassword')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<object> {
    try {
      const result =
        await this.authenticationService.forgotPassword(forgotPasswordDto);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof UnprocessableEntityException) {
        throw new UnprocessableEntityException('User');
      } else {
        throw new InternalServerErrorException('forgotPassword');
      }
    }
  }

  @Post('recoverPassword')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  async recoverPassword(
    @Headers('resetToken') resetToken: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<object> {
    try {
      const result = await this.authenticationService.changePassword(
        resetToken,
        changePasswordDto,
      );
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException('changePassword');
      }
    }
  }

  @Post('resetPassword')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<object> {
    try {
      const result =
        await this.authenticationService.resetPassword(resetPasswordDto);
      return result;
    } catch (error) {
      if (error instanceof UnprocessableEntityException) {
        throw new UnprocessableEntityException();
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      } else {
        throw new InternalServerErrorException('resetPassword');
      }
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Headers('Authorization') token: string,
  ): Promise<{ data: { message: string } }> {
    try {
      const result = await this.authenticationService.logout(token);
      return { data: result };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      } else {
        throw new InternalServerErrorException('logout');
      }
    }
  }
}
