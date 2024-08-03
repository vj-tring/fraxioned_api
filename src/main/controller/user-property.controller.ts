import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  Patch,
} from '@nestjs/common';
import { UserPropertyService } from 'services/user-property.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserPropertyDTO } from '../dto/requests/create-user-property.dto';
import { UpdateUserPropertyDTO } from '../dto/requests/update-user-property.dto';

@ApiTags('UserProperty')
@Controller('v1/user-properties')
export class UserPropertyController {
  constructor(private readonly userPropertyService: UserPropertyService) {}

  @Post('user-property')
  async createUserProperty(
    @Body() createUserPropertyDto: CreateUserPropertyDTO,
  ): Promise<object> {
    return this.userPropertyService.createUserProperty(createUserPropertyDto);
  }

  @Get()
  async getUserProperties(): Promise<object> {
    return this.userPropertyService.getUserProperties();
  }

  @Get('user-property/:id')
  async getUserPropertyById(@Param('id') id: number): Promise<object> {
    return this.userPropertyService.getUserPropertyById(id);
  }

  @Patch('user-property/:id')
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
  async deleteUserProperty(@Param('id') id: number): Promise<object> {
    return this.userPropertyService.deleteUserProperty(id);
  }
}
