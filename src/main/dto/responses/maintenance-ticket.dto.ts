import { IsNotEmpty } from 'class-validator';

export class MaintenanceTicketResponseDto {
  @IsNotEmpty()
  status: number;

  @IsNotEmpty()
  message: string;
}
