import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserDocumentService } from 'services/user-document.service';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { CreateUserDocumentDTO } from 'dto/requests/create-user-document.dto';
import { UpdateUserDocumentDTO } from 'dto/requests/update-user-document.dto';
import { AuthGuard } from 'commons/guards/auth.guard';

@ApiTags('UserDocument')
@Controller('v1/user-documents')
export class UserDocumentController {
  constructor(private readonly userDocumentService: UserDocumentService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async createUserDocument(
    @Body() createUserDocumentDto: CreateUserDocumentDTO,
  ): Promise<object> {
    return this.userDocumentService.createUserDocument(createUserDocumentDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async getUserDocuments(): Promise<object> {
    return this.userDocumentService.getUserDocuments();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async getUserDocumentById(@Param('id') id: number): Promise<object> {
    return this.userDocumentService.getUserDocumentById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async updateUserDocument(
    @Param('id') id: number,
    @Body() updateUserDocumentDto: UpdateUserDocumentDTO,
  ): Promise<object> {
    return this.userDocumentService.updateUserDocument(
      id,
      updateUserDocumentDto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async deleteUserDocument(@Param('id') id: number): Promise<object> {
    return this.userDocumentService.deleteUserDocument(id);
  }
}
