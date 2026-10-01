import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import { AppException } from '../exceptions/app.exception';
import { userClient } from '../utils/userClient';
import type { RequestWithAuthUser } from './supabaseAuth.guard';

// The same `user_roles` row the RLS policies check, so the two cannot
// disagree.
@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { authUser } = context
      .switchToHttp()
      .getRequest<RequestWithAuthUser>();

    if (!authUser)
      throw new AppException('Not authenticated', 401, 'UNAUTHORIZED');

    const { data } = await userClient(authUser)
      .from('user_roles')
      .select('role')
      .eq('id_user', authUser.idUser)
      .eq('role', 'admin')
      .maybeSingle();

    if (!data) throw new AppException('Admins only', 403, 'FORBIDDEN');

    return true;
  }
}
