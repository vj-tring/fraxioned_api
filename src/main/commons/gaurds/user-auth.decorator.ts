import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserAuth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.headers['user-id'];
    const accessToken = request.headers['access-token'];
    return { userId: Number(userId), accessToken };
  },
);
