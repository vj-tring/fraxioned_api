import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { User } from './user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user')
  async create(@Body() createUserDTO: CreateUserDTO): Promise<User> {
    return await this.userService.create(createUserDTO);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Get('user/:id')
  async findOne(@Param('id') id: number): Promise<User> {
    return await this.userService.findOne(id);
  }

  @Put('user/:id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<User> {
    return await this.userService.update(id, updateUserDTO);
  }

  @Delete('user/:id')
  async remove(@Param('id') id: number): Promise<void> {
    await this.userService.remove(id);
  }
}
