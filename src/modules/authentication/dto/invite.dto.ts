import { ApiProperty } from '@nestjs/swagger';

export class InviteDTO {
  @ApiProperty()
  email: string;

  @ApiProperty()
  roleId: number;

  @ApiProperty()
  invitedBy: number;
}
