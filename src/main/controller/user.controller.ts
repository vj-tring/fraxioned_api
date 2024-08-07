import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from 'services/user.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDTO } from 'dto/requests/create-user.dto';
import { UpdateUserDTO } from 'dto/requests/update-user.dto';
import { AuthGuard } from 'commons/guards/auth.guard';
import { SetActiveStatusDTO } from '../dto/requests/set-active.dto';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';

@ApiTags('User')
@Controller('v1/users')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user')
  async createUser(@Body() createUserDto: CreateUserDTO): Promise<object> {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  async getUsers(): Promise<object> {
    return this.userService.getUsers();
  }

  @Get('user/:id')
  async getUserById(@Param('id') id: number): Promise<object> {
    return this.userService.getUserById(id);
  }

  @Patch('user/:id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<object> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Patch('user/:id/set-active-status')
  async setActiveStatus(
    @Param('id') id: number,
    @Body() setActiveStatusDto: SetActiveStatusDTO,
  ): Promise<object> {
    return this.userService.setActiveStatus(id, setActiveStatusDto.isActive);
  }
}
