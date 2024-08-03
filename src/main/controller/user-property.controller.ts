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
import { UserPropertyService } from 'services/user-property.service';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { CreateUserPropertyDTO } from '../dto/requests/create-user-property.dto';
import { UpdateUserPropertyDTO } from '../dto/requests/update-user-property.dto';
import { AuthGuard } from '../commons/guards/auth.guard';

@ApiTags('UserProperty')
@Controller('v1/user-properties')
export class UserPropertyController {
  constructor(private readonly userPropertyService: UserPropertyService) {}

  @Post('user-property')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async createUserProperty(
    @Body() createUserPropertyDto: CreateUserPropertyDTO,
  ): Promise<object> {
    return this.userPropertyService.createUserProperty(createUserPropertyDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async getUserProperties(): Promise<object> {
    return this.userPropertyService.getUserProperties();
  }

  @Get('user-property/:id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async getUserPropertyById(@Param('id') id: number): Promise<object> {
    return this.userPropertyService.getUserPropertyById(id);
  }

  @Patch('user-property/:id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async updateUserProperty(
    @Param('id') id: number,
    @Body() updateUserPropertyDto: UpdateUserPropertyDTO,
  ): Promise<object> {
    return this.userPropertyService.updateUserProperty(
      id,
      updateUserPropertyDto,
    );
  }

  @Delete('user-property/:id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async deleteUserProperty(@Param('id') id: number): Promise<object> {
    return this.userPropertyService.deleteUserProperty(id);
  }
}
