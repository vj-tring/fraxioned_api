import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MaintenanceTicketDto } from '../dto/requests/maintenance-ticket.dto';
import { MaintenanceService } from '../service/maintenance.service';
import { ApiTags } from '@nestjs/swagger';
import { MaintenanceTicketResponseDto } from '../dto/responses/maintenance-ticket.dto';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { AuthGuard } from '../commons/guards/auth.guard';

@ApiTags('Maintenance Ticket')
@Controller('v1/maintenance-ticket')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async maintenanceTicket(
    @Body() maintenanceTicketDto: MaintenanceTicketDto,
  ): Promise<MaintenanceTicketResponseDto | object> {
    try {
      return await this.maintenanceService.maintenanceTicket(
        maintenanceTicketDto,
      );
    } catch (error) {
      return error;
    }
  }
}
