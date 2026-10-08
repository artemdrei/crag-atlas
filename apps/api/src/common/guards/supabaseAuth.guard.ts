import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

import { supabaseConfig } from '../../config/supabase.config';
import { UnauthorizedException } from '../exceptions/app.exception';

export interface AuthUser {
  idUser: string;
  accessToken: string;
}

export interface RequestWithAuthUser {
  headers: Record<string, string | string[] | undefined>;
  authUser?: AuthUser;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuthUser>();
    const accessToken = readBearerToken(request);

    if (!accessToken) throw new UnauthorizedException('Missing access token');

    // Per request: a vehicle for verifying this one token, with the config
    // read lazily so booting without env still works.
    const { url, anonKey } = supabaseConfig();
    const { data, error } = await createClient(url, anonKey).auth.getUser(
      accessToken
    );

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    request.authUser = { idUser: data.user.id, accessToken };

    return true;
  }
}

export const readBearerToken = (
  request: RequestWithAuthUser
): string | null => {
  const header = request.headers.authorization;
  const value = Array.isArray(header) ? header[0] : header;

  if (!value?.startsWith('Bearer ')) return null;

  return value.slice('Bearer '.length).trim() || null;
};
