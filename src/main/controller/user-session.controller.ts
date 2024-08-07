import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserSessionService } from 'services/user-session.service';
import { CreateUserSessionDTO } from 'dto/requests/create-user-session.dto';
import { UpdateUserSessionDTO } from 'dto/requests/update-user-session.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { AuthGuard } from '../commons/guards/auth.guard';

@ApiTags('UserSession')
@Controller('v1/user-sessions')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class UserSessionController {
  constructor(private readonly userSessionService: UserSessionService) {}

  @Post('user-session')
  async createUserSession(
    @Body() createUserSessionDto: CreateUserSessionDTO,
  ): Promise<object> {
    return this.userSessionService.createUserSession(createUserSessionDto);
  }

  @Get()
  async getUserSessions(): Promise<object> {
    return this.userSessionService.getUserSessions();
  }

  @Get('user-session/:id')
  async getUserSessionById(@Param('id') id: number): Promise<object> {
    return this.userSessionService.getUserSessionById(id);
  }

  @Patch('user-session/:id')
  async updateUserSession(
    @Param('id') id: number,
    @Body() updateUserSessionDto: UpdateUserSessionDTO,
  ): Promise<object> {
    return this.userSessionService.updateUserSession(id, updateUserSessionDto);
  }

  @Delete('user-session/:id')
  async deleteUserSession(@Param('id') id: number): Promise<object> {
    return this.userSessionService.deleteUserSession(id);
  }
}
