import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDTO {
    @ApiProperty()
    newPassword: string;
  }
  