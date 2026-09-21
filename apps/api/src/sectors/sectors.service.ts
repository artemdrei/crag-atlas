import { Injectable } from '@nestjs/common';

import {
  AppException,
  NotFoundException
} from '../common/exceptions/app.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import type { GradeScale } from '../common/utils/grade';
import { userClient } from '../common/utils/userClient';
import { publicSupabase, storagePublicUrl } from '../config/supabase.client';
import type { SectorDto, UpdateSectorDto } from './sectors.types';

// The region name rides along: ids are uuids, so a page opened by URL has no
// label to show in its breadcrumbs otherwise.
const COLUMNS =
  'id, id_region, name, description, route_count, grade_min, grade_min_scale, grade_max, grade_max_scale, regions (name), topos (storage_path, sort_order)';

interface SectorRow {
  id: string;
  id_region: string;
  name: string;
  description: string;
  route_count: number;
  grade_min: string | null;
  grade_min_scale: GradeScale | null;
  grade_max: string | null;
  grade_max_scale: GradeScale | null;
  regions: { name: string } | null;
  topos: { storage_path: string; sort_order: number }[];
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
        description: payload.description ?? ''
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
  photoUrl: toPhotoUrl(row),
  description: row.description,
  routeCount: row.route_count,
  gradeMin: row.grade_min,
  gradeMinScale: row.grade_min_scale,
  gradeMax: row.grade_max,
  gradeMaxScale: row.grade_max_scale
});

const toPhotoUrl = (row: SectorRow): string | null => {
  const [first] = [...row.topos].sort((a, b) => a.sort_order - b.sort_order);

  return first ? storagePublicUrl('topos', first.storage_path) : null;
};
