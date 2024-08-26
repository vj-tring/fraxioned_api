import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let authService: AuthenticationService;
  let mockExecutionContext: Partial<ExecutionContext>;

  beforeEach(() => {
    authService = {
      validateUser: jest.fn(),
    } as unknown as AuthenticationService;
    authGuard = new AuthGuard(authService);

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {},
        }),
      }),
    };
  });

  it('should throw UnauthorizedException if user-id header is missing', async () => {
    const context = mockExecutionContext as ExecutionContext;

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException(
        'Please provide a valid user ID and access token',
      ),
    );
  });

  it('should throw UnauthorizedException if access-token header is missing', async () => {
    const context = mockExecutionContext as ExecutionContext;
    context.switchToHttp().getRequest().headers['user-id'] = '1';

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException(
        'Please provide a valid user ID and access token',
      ),
    );
  });

  it('should throw UnauthorizedException if validateUser returns false', async () => {
    const context = mockExecutionContext as ExecutionContext;
    context.switchToHttp().getRequest().headers['user-id'] = '1';
    context.switchToHttp().getRequest().headers['access-token'] = 'token';

    (authService.validateUser as jest.Mock).mockResolvedValue(false);

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException(
        'The provided user ID or access token is invalid',
      ),
    );
  });

  it('should return true if validateUser returns true', async () => {
    const context = mockExecutionContext as ExecutionContext;
    context.switchToHttp().getRequest().headers['user-id'] = '1';
    context.switchToHttp().getRequest().headers['access-token'] = 'token';

    (authService.validateUser as jest.Mock).mockResolvedValue(true);

    const result = await authGuard.canActivate(context);

    expect(result).toBe(true);
  });
});
