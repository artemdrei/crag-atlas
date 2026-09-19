import { Injectable } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import {
  AppException,
  ValidationException
} from '../common/exceptions/app.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { supabaseConfig } from '../config/supabase.config';
import { ASCENT_STYLES, type CreateTickDto, type TickDto } from './ticks.types';

// The catalog rows come back embedded through the ticks → routes → sectors
// foreign keys, so a logbook page is one query, not one per tick.
const COLUMNS = '*, routes (name, grade, sectors (name))';

interface TickRow {
  id: string;
  id_user: string;
  id_route: string;
  ascent_style: TickDto['ascentStyle'];
  climbed_at: string;
  attempts: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  routes: {
    name: string;
    grade: string;
    sectors: { name: string } | null;
  } | null;
}

@Injectable()
export class TicksService {
  async findMine(authUser: AuthUser): Promise<TickDto[]> {
    // No filter on id_user: the RLS select policy already scopes this to the
    // caller, and a second filter would only hide a policy regression.
    const { data, error } = await this.userClient(authUser)
      .from('ticks')
      .select(COLUMNS)
      .order('climbed_at', { ascending: false })
      .returns<TickRow[]>();

    if (error) {
      throw new AppException(
        error.message,
        400,
        error.code ?? 'TICKS_READ_FAILED'
      );
    }

    return data.map(toTickDto);
  }

  async create(authUser: AuthUser, payload: CreateTickDto): Promise<TickDto> {
    if (!payload.idRoute?.trim()) {
      throw new ValidationException('idRoute is required');
    }

    if (!ASCENT_STYLES.includes(payload.ascentStyle)) {
      throw new ValidationException(
        `ascentStyle must be one of: ${ASCENT_STYLES.join(', ')}`
      );
    }

    const { data, error } = await this.userClient(authUser)
      .from('ticks')
      .insert({
        // Taken from the verified token, never from the body — RLS checks the
        // same value, so a forged one would be rejected by the database too.
        id_user: authUser.idUser,
        id_route: payload.idRoute.trim(),
        ascent_style: payload.ascentStyle,
        climbed_at: payload.climbedAt,
        attempts: payload.attempts ?? null,
        note: payload.note ?? null
      })
      .select(COLUMNS)
      .single<TickRow>();

    if (error) {
      throw new AppException(
        error.message,
        400,
        error.code ?? 'TICK_INSERT_FAILED'
      );
    }

    return toTickDto(data);
  }

  /** Calls the database as the user, so their RLS policies still apply. */
  private userClient({ accessToken }: AuthUser): SupabaseClient {
    const { url, anonKey } = supabaseConfig();

    return createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
}

const toTickDto = (row: TickRow): TickDto => ({
  id: row.id,
  idUser: row.id_user,
  idRoute: row.id_route,
  routeName: row.routes?.name ?? null,
  routeGrade: row.routes?.grade ?? null,
  sectorName: row.routes?.sectors?.name ?? null,
  ascentStyle: row.ascent_style,
  climbedAt: row.climbed_at,
  attempts: row.attempts,
  note: row.note,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});
