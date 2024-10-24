import { Injectable } from '@nestjs/common';
import { LoggerService } from '../service/logger.service';
import { ApiResponse } from '../commons/response-body/common.responses';
import { USER_RESPONSES } from '../commons/constants/response-constants/user.constant';

@Injectable()
export class UserResponseHandler {
  constructor(private readonly logger: LoggerService) {}

  async handleUserNotFound(): Promise<ApiResponse<null>> {
    this.logger.error(`User not found`);
    return USER_RESPONSES.USER_NOT_FOUND();
  }
}
