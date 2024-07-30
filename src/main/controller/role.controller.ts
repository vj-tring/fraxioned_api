import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { RoleService } from 'services/role.service';
import { CreateRoleDTO } from 'dto/createRole.dto';
import { UpdateRoleDTO } from 'dto/updateRole.dto';
import { Role } from 'entities/role.entity';
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
  async getRoles(): Promise<Role[] | NotFoundException> {
    return this.roleService.getRoles();
  }

  @Get('role/:id')
  async getRoleById(@Param('id') id: number): Promise<Role> {
    return this.roleService.getRoleById(id);
  }

  @Put('role/:id')
  async updateRole(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDTO,
  ): Promise<Role> {
    return this.roleService.updateRole(id, updateRoleDto);
  }

  @Delete('role/:id')
  async deleteRole(@Param('id') id: number): Promise<void> {
    return this.roleService.deleteRole(id);
  }
}
