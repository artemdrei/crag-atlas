import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

import { supabaseConfig } from '../../config/supabase.config';
import { AppException } from '../exceptions/app.exception';
import type { RequestWithAuthUser } from './supabaseAuth.guard';

/**
 * Runs after SupabaseAuthGuard and asks the database whether this user is an
 * admin — the same `user_roles` row the RLS policies check, so the two can
 * never disagree.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { authUser } = context
      .switchToHttp()
      .getRequest<RequestWithAuthUser>();

    if (!authUser)
      throw new AppException('Not authenticated', 401, 'UNAUTHORIZED');

    const { url, anonKey } = supabaseConfig();
    const client = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${authUser.accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data } = await client
      .from('user_roles')
      .select('role')
      .eq('id_user', authUser.idUser)
      .eq('role', 'admin')
      .maybeSingle();

    if (!data) throw new AppException('Admins only', 403, 'FORBIDDEN');

    return true;
  }
}
