import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  UnprocessableEntityException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';
import { InviteUserDto } from 'src/main/dto/requests/auth/inviteUser.dto';
import { LoginDto } from 'src/main/dto/requests/auth/login.dto';
import { ForgotPasswordDto } from 'src/main/dto/requests/auth/forgotPassword.dto';
import { ResetPasswordDto } from 'src/main/dto/requests/auth/resetPassword.dto';
import { ChangePasswordDto } from 'src/main/dto/requests/auth/recoverPassword.dto';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { InviteService } from '../service/auth/invite.service';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';

@ApiTags('Authentication')
@Controller('v1/authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly inviteService: InviteService,
  ) {}

  @Post('invite')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  inviteUser(@Body() inviteUserDto: InviteUserDto): Promise<object> {
    return this.inviteService.inviteUser(inviteUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<object> {
    const result = await this.authenticationService.login(loginDto);
    return result;
  }

  @Post('forgotPassword')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<object> {
    try {
      const result =
        await this.authenticationService.forgotPassword(forgotPasswordDto);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return new NotFoundException(error.message);
      } else if (error instanceof UnprocessableEntityException) {
        return new UnprocessableEntityException('User');
      } else {
        return new InternalServerErrorException('forgotPassword');
      }
    }
  }

  @Post('recoverPassword')
  @HttpCode(HttpStatus.OK)
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
        return new BadRequestException(error.message);
      } else if (error instanceof NotFoundException) {
        return new NotFoundException(error.message);
      } else {
        return new InternalServerErrorException('changePassword');
      }
    }
  }

  @Post('resetPassword')
  @UseGuards(AuthGuard)
  @ApiHeadersForAuth()
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<object> {
    try {
      const result =
        await this.authenticationService.resetPassword(resetPasswordDto);
      return result;
    } catch (error) {
      if (error instanceof UnprocessableEntityException) {
        return new UnprocessableEntityException();
      } else if (error instanceof NotFoundException) {
        return new NotFoundException(error.message);
      } else if (error instanceof UnauthorizedException) {
        return new UnauthorizedException(error.message);
      } else {
        return new InternalServerErrorException('resetPassword');
      }
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Headers('user-id') userId: number,
    @Headers('access-token') token: string,
  ): Promise<object> {
    try {
      const result = await this.authenticationService.logout(userId, token);
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new UnauthorizedException(error.message);
      } else {
        return new InternalServerErrorException('logout');
      }
    }
  }
}
