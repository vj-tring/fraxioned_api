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
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { CreateUserPropertyDTO } from '../dto/requests/user-property/create-user-property.dto';
import { UpdateUserPropertyDTO } from '../dto/requests/user-property/update-user-property.dto';

@ApiTags('UserProperty')
@Controller('v1/user-properties')
// @UseGuards(AuthGuard)
// @ApiHeadersForAuth()
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
    @Body() updateUserPropertyDto: UpdateUserPropertyDTO,
  ): Promise<object> {
    return this.userPropertyService.updateUserProperty(updateUserPropertyDto);
  }

  @Delete('user-property/user/:userId/property/:propertyId')
  async deleteUserProperty(
    @Param('userId') userId: number,
    @Param('propertyId') propertyId: number,
  ): Promise<object> {
    return this.userPropertyService.removePropertyForUser(userId, propertyId);
  }
}
