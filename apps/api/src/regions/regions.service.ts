import { Injectable } from '@nestjs/common';

import { AppException } from '../common/exceptions/app.exception';
import { publicSupabase } from '../config/supabase.client';
import type { RegionDto } from './regions.types';

interface RegionRow {
  id: string;
  name: string;
  province: string;
  rock_type: string;
  grade_range: string;
  sector_count: number;
  route_count: number;
}

@Injectable()
export class RegionsService {
  async findAll(): Promise<RegionDto[]> {
    const { data, error } = await publicSupabase()
      .from('regions')
      .select(
        'id, name, province, rock_type, grade_range, sector_count, route_count'
      )
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
}

const toRegionDto = (row: RegionRow): RegionDto => ({
  id: row.id,
  name: row.name,
  province: row.province,
  rockType: row.rock_type,
  gradeRange: row.grade_range,
  sectorCount: row.sector_count,
  routeCount: row.route_count
});
