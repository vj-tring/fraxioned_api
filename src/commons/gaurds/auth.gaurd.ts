import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
  } from '@nestjs/common';
  import { AuthenticationService } from 'src/service/authentication.service';
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(private authService: AuthenticationService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const userId = request.headers['user-id'];
      const accessToken = request.headers['access-token'];

      if (!userId || !accessToken) {
        throw new UnauthorizedException(
          'Please provide a valid user ID and access token',
        );
      }

      const isValid = await this.authService.validateUser(
        Number(userId),
        accessToken,
      );

      if (!isValid) {
        throw new UnauthorizedException(
          'The provided user ID or access token is invalid',
        );
      }

      return true;
    }
  }
