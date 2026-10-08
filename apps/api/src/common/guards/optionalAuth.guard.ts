import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

import { supabaseConfig } from '../../config/supabase.config';
import { UnauthorizedException } from '../exceptions/app.exception';
import {
  type RequestWithAuthUser,
  readBearerToken
} from './supabaseAuth.guard';

export interface OptionalAuthRequest extends RequestWithAuthUser {
  authEmail?: string;
}

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<OptionalAuthRequest>();
    const accessToken = readBearerToken(request);

    if (!accessToken) return true;

    const { url, anonKey } = supabaseConfig();
    const { data, error } = await createClient(url, anonKey).auth.getUser(
      accessToken
    );

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    request.authUser = { idUser: data.user.id, accessToken };
    request.authEmail = data.user.email;

    return true;
  }
}
