import { Injectable } from '@nestjs/common';

import { readFailed } from '../common/exceptions/database.exception';
import { publicSupabase } from '../config/supabase.client';
import type { UserSummaryDto } from './users.types';

const SEARCH_LIMIT = 10;

interface UserRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

@Injectable()
export class UsersService {
  async search(query?: string): Promise<UserSummaryDto[]> {
    const term = query?.trim() ?? '';

    if (!term) return [];

    const { data, error } = await publicSupabase()
      .from('users')
      .select('id, display_name, avatar_url')
      .ilike('display_name', `%${term}%`)
      .order('display_name')
      .limit(SEARCH_LIMIT)
      .returns<UserRow[]>();

    if (error) {
      throw readFailed('Could not search climbers', 'USERS_READ_FAILED', error);
    }

    return data.map((row) => ({
      id: row.id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url
    }));
  }
}
