import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

import { UnauthorizedException } from '../exceptions/app.exception';
import type {
  AuthUser,
  RequestWithAuthUser
} from '../guards/supabaseAuth.guard';

/** Only valid on a route guarded by SupabaseAuthGuard, which fills authUser. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<RequestWithAuthUser>();

    if (!request.authUser) throw new UnauthorizedException();

    return request.authUser;
  }
);
