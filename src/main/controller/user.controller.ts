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
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { CreateUserDTO } from 'dto/requests/create-user.dto';
import { UpdateUserDTO } from 'dto/requests/update-user.dto';
import { AuthGuard } from 'commons/guards/auth.guard';
import { SetActiveStatusDTO } from '../dto/requests/set-active.dto';

@ApiTags('User')
@Controller('v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async createUser(@Body() createUserDto: CreateUserDTO): Promise<object> {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async getUsers(): Promise<object> {
    return this.userService.getUsers();
  }

  @Get('user/:id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async getUserById(@Param('id') id: number): Promise<object> {
    return this.userService.getUserById(id);
  }

  @Patch('user/:id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<object> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Patch('user/:id/set-active-status')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async setActiveStatus(
    @Param('id') id: number,
    @Body() setActiveStatusDto: SetActiveStatusDTO,
  ): Promise<object> {
    return this.userService.setActiveStatus(id, setActiveStatusDto.isActive);
  }
}
