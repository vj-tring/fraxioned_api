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
import { AuthenticationService } from 'src/main/service/authentication.service';
import { InviteUserDto } from 'src/main/dto/inviteUser.dto';
import { LoginDto } from 'src/main/dto/login.dto';
import { ForgotPasswordDto } from 'src/main/dto/forgotPassword.dto';
import { ResetPasswordDto } from 'src/main/dto/resetPassword.dto';
import { ChangePasswordDto } from 'src/main/dto/recoverPassword.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/main/entities/user.entity';

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
  async logout(@Headers('Authorization') token: string): Promise<object> {
    try {
      const result = await this.authenticationService.logout(token);
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      } else {
        throw new InternalServerErrorException('logout');
      }
    }
  }
}