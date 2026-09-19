import { Injectable } from '@nestjs/common';

import {
  AppException,
  NotFoundException
} from '../common/exceptions/app.exception';
import { publicSupabase } from '../config/supabase.client';
import type { SectorDto } from './sectors.types';

interface SectorRow {
  id: string;
  id_region: string;
  name: string;
  description: string;
  grade_range: string;
  approach_minutes: number | null;
  route_count: number;
}

@Injectable()
export class SectorsService {
  async findByRegion(idRegion: string): Promise<SectorDto[]> {
    const { data, error } = await publicSupabase()
      .from('sectors')
      .select(
        'id, id_region, name, description, grade_range, approach_minutes, route_count'
      )
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
}

const toSectorDto = (row: SectorRow): SectorDto => ({
  id: row.id,
  idRegion: row.id_region,
  name: row.name,
  description: row.description,
  gradeRange: row.grade_range,
  approachMinutes: row.approach_minutes ?? 0,
  routeCount: row.route_count
});
