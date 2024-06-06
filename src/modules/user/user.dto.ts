import { ApiProperty } from '@nestjs/swagger';

export class UserDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  username: string;
  @ApiProperty()
  phone: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  roleId: number;
  @ApiProperty()
  isActive: boolean;
  @ApiProperty()
  currentSessionId: string;
  @ApiProperty()
  resetToken: string;
  @ApiProperty()
  inviteToken: string;
  @ApiProperty()
  lastLoginTime: Date;
  @ApiProperty()
  lastUpdated: Date;
  @ApiProperty()
  createdAt: Date;
}
