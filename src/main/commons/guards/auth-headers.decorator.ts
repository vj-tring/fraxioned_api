import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

export function ApiHeadersForAuth(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiHeader({ name: 'user-id', required: true, description: 'User ID' }),
    ApiHeader({
      name: 'access-token',
      required: true,
      description: 'Access Token',
    }),
  );
}
