import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  Patch,
} from '@nestjs/common';
import { RoleService } from 'services/role.service';
import { CreateRoleDTO } from 'dto/createRole.dto';
import { UpdateRoleDTO } from 'dto/updateRole.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Role')
@Controller('api/roles')
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