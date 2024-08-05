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
import { UserService } from 'services/user.service';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { CreateUserDTO } from 'dto/requests/create-user.dto';
import { UpdateUserDTO } from 'dto/requests/update-user.dto';
import { AuthGuard } from 'commons/guards/auth.guard';

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

  @Delete('user/:id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async deleteUser(@Param('id') id: number): Promise<object> {
    return this.userService.deleteUser(id);
  }
}
