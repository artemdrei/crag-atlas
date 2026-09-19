import { Injectable } from '@nestjs/common';

import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { userClient } from '../common/utils/userClient';
import type { MeDto } from './me.types';

@Injectable()
export class MeService {
  async findMe(authUser: AuthUser): Promise<MeDto> {
    // Asking as the user: the select policy only ever returns their own row,
    // so a missing row and "not an admin" are the same answer.
    const { data } = await userClient(authUser)
      .from('user_roles')
      .select('role')
      .eq('role', 'admin')
      .maybeSingle();

    return { idUser: authUser.idUser, isAdmin: !!data };
  }
}
