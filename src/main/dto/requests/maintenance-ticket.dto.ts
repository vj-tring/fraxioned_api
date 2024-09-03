import { IsInt, IsNotEmpty } from 'class-validator';

export class MaintenanceTicketDto {
  @IsNotEmpty()
  ticketSubject: string;

  @IsNotEmpty()
  ticketDescription: string;

  @IsInt()
  senderId: number;
}
