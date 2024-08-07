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
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDocumentDTO } from 'dto/requests/create-user-document.dto';
import { UpdateUserDocumentDTO } from 'dto/requests/update-user-document.dto';
import { AuthGuard } from 'commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';

@ApiTags('UserDocument')
@Controller('v1/user-documents')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class UserDocumentController {
  constructor(private readonly userDocumentService: UserDocumentService) {}

  @Post()
  async createUserDocument(
    @Body() createUserDocumentDto: CreateUserDocumentDTO,
  ): Promise<object> {
    return this.userDocumentService.createUserDocument(createUserDocumentDto);
  }

  @Get()
  async getUserDocuments(): Promise<object> {
    return this.userDocumentService.getUserDocuments();
  }

  @Get(':id')
  async getUserDocumentById(@Param('id') id: number): Promise<object> {
    return this.userDocumentService.getUserDocumentById(id);
  }

  @Patch(':id')
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
  async deleteUserDocument(@Param('id') id: number): Promise<object> {
    return this.userDocumentService.deleteUserDocument(id);
  }
}
