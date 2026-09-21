import { Injectable } from '@nestjs/common';

import {
  AppException,
  NotFoundException
} from '../common/exceptions/app.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import type { GradeScale } from '../common/utils/grade';
import { userClient } from '../common/utils/userClient';
import { publicSupabase } from '../config/supabase.client';
import type { RegionDto, UpdateRegionDto } from './regions.types';

// Counts and grade ranges are derived, so reads come from the view and writes
// go to the table underneath it.
const COLUMNS =
  'id, name, province, rock_type, sector_count, route_count, grade_min, grade_min_scale, grade_max, grade_max_scale';

interface RegionRow {
  id: string;
  name: string;
  province: string;
  rock_type: string;
  sector_count: number;
  route_count: number;
  grade_min: string | null;
  grade_min_scale: GradeScale | null;
  grade_max: string | null;
  grade_max_scale: GradeScale | null;
}

@Injectable()
export class RegionsService {
  async findAll(): Promise<RegionDto[]> {
    const { data, error } = await publicSupabase()
      .from('regions_with_stats')
      .select(COLUMNS)
      .order('name')
      .returns<RegionRow[]>();

    if (error) {
      throw new AppException(
        error.message,
        500,
        error.code ?? 'REGIONS_READ_FAILED'
      );
    }

    return data.map(toRegionDto);
  }

  async findOne(idRegion: string): Promise<RegionDto> {
    const { data, error } = await publicSupabase()
      .from('regions_with_stats')
      .select(COLUMNS)
      .eq('id', idRegion)
      .maybeSingle<RegionRow>();

    if (error) {
      throw new AppException(
        error.message,
        500,
        error.code ?? 'REGION_READ_FAILED'
      );
    }

    if (!data) {
      throw new NotFoundException(
        `Region "${idRegion}" not found`,
        'REGION_NOT_FOUND'
      );
    }

    return toRegionDto(data);
  }

  async update(
    authUser: AuthUser,
    idRegion: string,
    payload: UpdateRegionDto
  ): Promise<RegionDto> {
    const { error } = await userClient(authUser)
      .from('regions')
      .update({
        name: payload.name,
        province: payload.province,
        rock_type: payload.rockType
      })
      .eq('id', idRegion);

    if (error) {
      throw new AppException(
        error.message,
        400,
        error.code ?? 'REGION_UPDATE_FAILED'
      );
    }

    return this.findOne(idRegion);
  }
}

const toRegionDto = (row: RegionRow): RegionDto => ({
  id: row.id,
  name: row.name,
  province: row.province,
  rockType: row.rock_type,
  sectorCount: row.sector_count,
  routeCount: row.route_count,
  gradeMin: row.grade_min,
  gradeMinScale: row.grade_min_scale,
  gradeMax: row.grade_max,
  gradeMaxScale: row.grade_max_scale
});
