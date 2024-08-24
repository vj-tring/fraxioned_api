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
import { RoleService } from 'src/main/service/role.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { CreateRoleDTO } from '../dto/requests/role/createRole.dto';
import { UpdateRoleDTO } from '../dto/requests/role/updateRole.dto';

@ApiTags('Role')
@Controller('v1/roles')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('role')
  async createRole(@Body() createRoleDto: CreateRoleDTO): Promise<object> {
    return this.roleService.createRole(createRoleDto);
  }

  @Get()
  async getRoles(): Promise<object> {
    return this.roleService.getRoles();
  }

  @Get('role/:id')
  async getRoleById(@Param('id') id: number): Promise<object> {
    return this.roleService.getRoleById(id);
  }

  @Patch('role/:id')
  async updateRole(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDTO,
  ): Promise<object> {
    return this.roleService.updateRole(id, updateRoleDto);
  }

  @Delete('role/:id')
  async deleteRole(@Param('id') id: number): Promise<object> {
    return this.roleService.deleteRole(id);
  }
}
