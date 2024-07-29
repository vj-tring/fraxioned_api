import { Controller } from '@nestjs/common';
import { UsersService } from 'src/service/users.service';
import { LoggerService } from 'src/service/logger.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: LoggerService,
  ) {}
}
