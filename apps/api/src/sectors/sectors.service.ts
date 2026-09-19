import { Injectable } from '@nestjs/common';

import {
  AppException,
  NotFoundException
} from '../common/exceptions/app.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { userClient } from '../common/utils/userClient';
import { publicSupabase } from '../config/supabase.client';
import type { SectorDto, UpdateSectorDto } from './sectors.types';

// The region name rides along: ids are uuids, so a page opened by URL has no
// label to show in its breadcrumbs otherwise.
const COLUMNS =
  'id, id_region, name, description, approach_minutes, route_count, grade_min, grade_max, regions (name)';

interface SectorRow {
  id: string;
  id_region: string;
  name: string;
  description: string;
  approach_minutes: number | null;
  route_count: number;
  grade_min: string | null;
  grade_max: string | null;
  regions: { name: string } | null;
}

@Injectable()
export class SectorsService {
  async findByRegion(idRegion: string): Promise<SectorDto[]> {
    const { data, error } = await publicSupabase()
      .from('sectors_with_stats')
      .select(COLUMNS)
      .eq('id_region', idRegion)
      .order('name')
      .returns<SectorRow[]>();

    if (error) {
      throw new AppException(
        error.message,
        500,
        error.code ?? 'SECTORS_READ_FAILED'
      );
    }

    if (data.length === 0) {
      throw new NotFoundException(
        `No sectors found for region "${idRegion}"`,
        'REGION_NOT_FOUND'
      );
    }

    return data.map(toSectorDto);
  }

  async findOne(idSector: string): Promise<SectorDto> {
    const { data, error } = await publicSupabase()
      .from('sectors_with_stats')
      .select(COLUMNS)
      .eq('id', idSector)
      .maybeSingle<SectorRow>();

    if (error) {
      throw new AppException(
        error.message,
        500,
        error.code ?? 'SECTOR_READ_FAILED'
      );
    }

    if (!data) {
      throw new NotFoundException(
        `Sector "${idSector}" not found`,
        'SECTOR_NOT_FOUND'
      );
    }

    return toSectorDto(data);
  }

  async update(
    authUser: AuthUser,
    idSector: string,
    payload: UpdateSectorDto
  ): Promise<SectorDto> {
    const { error } = await userClient(authUser)
      .from('sectors')
      .update({
        name: payload.name,
        description: payload.description ?? '',
        approach_minutes: payload.approachMinutes ?? null
      })
      .eq('id', idSector);

    if (error) {
      throw new AppException(
        error.message,
        400,
        error.code ?? 'SECTOR_UPDATE_FAILED'
      );
    }

    return this.findOne(idSector);
  }
}

const toSectorDto = (row: SectorRow): SectorDto => ({
  id: row.id,
  idRegion: row.id_region,
  regionName: row.regions?.name ?? '',
  name: row.name,
  description: row.description,
  approachMinutes: row.approach_minutes,
  routeCount: row.route_count,
  gradeRange:
    row.grade_min && row.grade_max ? `${row.grade_min}-${row.grade_max}` : null
});
