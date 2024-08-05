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
import { CreateRoleDTO } from 'src/main/dto/requests/createRole.dto';
import { UpdateRoleDTO } from 'src/main/dto/requests/updateRole.dto';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';

@ApiTags('Role')
@Controller('v1/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('role')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async createRole(@Body() createRoleDto: CreateRoleDTO): Promise<object> {
    return this.roleService.createRole(createRoleDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async getRoles(): Promise<object> {
    return this.roleService.getRoles();
  }

  @Get('role/:id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async getRoleById(@Param('id') id: number): Promise<object> {
    return this.roleService.getRoleById(id);
  }

  @Patch('role/:id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async updateRole(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDTO,
  ): Promise<object> {
    return this.roleService.updateRole(id, updateRoleDto);
  }

  @Delete('role/:id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'user-id', required: true, description: 'User ID' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access Token',
  })
  async deleteRole(@Param('id') id: number): Promise<object> {
    return this.roleService.deleteRole(id);
  }
}
