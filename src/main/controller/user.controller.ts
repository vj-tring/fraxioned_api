import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  UseGuards,
  HttpStatus,
  HttpException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from 'services/user.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'commons/guards/auth.guard';
import { SetActiveStatusDTO } from '../dto/requests/user/set-active.dto';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { CreateUserDTO } from '../dto/requests/user/create-user.dto';
import { UpdateUserDTO } from '../dto/requests/user/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { validateFile } from '../utils/fileUploadValidation.Util';

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
  @UseInterceptors(FileInterceptor('profileImage'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update user details',
    type: UpdateUserDTO,
  })
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDTO,
    @UploadedFile() profileImage?: Express.Multer.File,
  ): Promise<object> {
    try {
      if (profileImage) {
        const validationResponse = await validateFile(profileImage);
        if (validationResponse) {
          return validationResponse;
        }
      }
      return await this.userService.updateUser(id, updateUserDto, profileImage);
    } catch (error) {
      throw new HttpException(
        'An error occurred while updating the user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('user/:id/set-active-status')
  async setActiveStatus(
    @Param('id') id: number,
    @Body() setActiveStatusDto: SetActiveStatusDTO,
  ): Promise<object> {
    return this.userService.setActiveStatus(id, setActiveStatusDto.isActive);
  }
}
