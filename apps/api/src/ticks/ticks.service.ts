import { Injectable } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import {
  AppException,
  ValidationException
} from '../common/exceptions/app.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { supabaseConfig } from '../config/supabase.config';
import { RoutesService } from '../routes/routes.service';
import { SectorsService } from '../sectors/sectors.service';
import { ASCENT_STYLES, type CreateTickDto, type TickDto } from './ticks.types';

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
}

@Injectable()
export class TicksService {
  constructor(
    private readonly routesService: RoutesService,
    private readonly sectorsService: SectorsService
  ) {}

  async findMine(authUser: AuthUser): Promise<TickDto[]> {
    // No filter on id_user: the RLS select policy already scopes this to the
    // caller, and a second filter would only hide a policy regression.
    const { data, error } = await this.userClient(authUser)
      .from('ticks')
      .select()
      .order('climbed_at', { ascending: false })
      .returns<TickRow[]>();

    if (error) {
      throw new AppException(
        error.message,
        400,
        error.code ?? 'TICKS_READ_FAILED'
      );
    }

    return data.map((row) => this.toTickDto(row));
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
      .select()
      .single<TickRow>();

    if (error) {
      throw new AppException(
        error.message,
        400,
        error.code ?? 'TICK_INSERT_FAILED'
      );
    }

    return this.toTickDto(data);
  }

  private toTickDto(row: TickRow): TickDto {
    // The catalog is static JSON for now, so this walk is two array lookups;
    // it becomes a join once the catalog lives in the database.
    const route = this.routesService.findOneOrNull(row.id_route);
    const sector = route && this.sectorsService.findOneOrNull(route.idSector);

    return {
      id: row.id,
      idUser: row.id_user,
      idRoute: row.id_route,
      routeName: route?.name ?? null,
      routeGrade: route?.grade ?? null,
      sectorName: sector?.name ?? null,
      ascentStyle: row.ascent_style,
      climbedAt: row.climbed_at,
      attempts: row.attempts,
      note: row.note,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
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
