import { Injectable } from '@nestjs/common';

import type { ClimberContentDto } from '../common/dto/climberContent.dto';
import type { GradeHistogramGroupDto } from '../common/dto/gradeHistogram.dto';
import {
  NotFoundException,
  ValidationException
} from '../common/exceptions/app.exception';
import {
  readFailed,
  writeFailed
} from '../common/exceptions/database.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import type { ArchiveTarget } from '../common/utils/archive';
import {
  archiveRow,
  eraseArchivedRow,
  restoreRow
} from '../common/utils/archive';
import { countClimberContent } from '../common/utils/climberContent';
import type { GradeScale } from '../common/utils/grade';
import { userClient } from '../common/utils/userClient';
import { publicSupabase, storagePublicUrl } from '../config/supabase.client';
import type {
  CreateSectorDto,
  SectorDto,
  UpdateSectorDto
} from './sectors.types';

interface Coords {
  lat: number | null;
  lng: number | null;
}

// The region name rides along: ids are uuids, so a page opened by URL has no
// label to show in its breadcrumbs otherwise.
const COLUMNS =
  'id, id_region, name, description, lat, lng, route_count, grade_min, grade_min_scale, grade_max, grade_max_scale, grade_histogram, is_archived, deleted_at, regions (name), topos (storage_path, sort_order)';

interface SectorRow {
  id: string;
  id_region: string;
  name: string;
  description: string;
  lat: number | null;
  lng: number | null;
  route_count: number;
  grade_min: string | null;
  grade_min_scale: GradeScale | null;
  grade_max: string | null;
  grade_max_scale: GradeScale | null;
  grade_histogram: GradeHistogramGroupDto[];
  is_archived: boolean;
  deleted_at: string | null;
  regions: { name: string } | null;
  topos: { storage_path: string; sort_order: number }[];
}

const TARGET: ArchiveTarget = {
  table: 'sectors',
  entity: 'SECTOR',
  noun: 'sector'
};

@Injectable()
export class SectorsService {
  async findByRegion(
    idRegion: string,
    isArchiveOnly = false
  ): Promise<SectorDto[]> {
    const query = publicSupabase()
      .from('sectors_with_stats')
      .select(COLUMNS)
      .eq('id_region', idRegion)
      .order('name');

    // Own mark either way: an archived region's page still lists what it held,
    // and its archive holds the sectors deleted from it.
    const { data, error } = await (isArchiveOnly
      ? query.not('deleted_at', 'is', null)
      : query.is('deleted_at', null)
    ).returns<SectorRow[]>();

    if (error) {
      throw readFailed(
        'Could not load the sectors',
        'SECTORS_READ_FAILED',
        error
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
      throw readFailed(
        'Could not load the sector',
        'SECTOR_READ_FAILED',
        error
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

  async create(
    authUser: AuthUser,
    idRegion: string,
    payload: CreateSectorDto
  ): Promise<SectorDto> {
    const name = payload.name?.trim() ?? '';

    if (!name) {
      throw new ValidationException('A name is required', 'SECTOR_NAME_EMPTY');
    }

    const { data, error } = await userClient(authUser)
      .from('sectors')
      .insert({
        id_region: idRegion,
        name,
        description: payload.description?.trim() ?? ''
      })
      .select('id')
      .single<{ id: string }>();

    if (error) {
      throw writeFailed(
        'Could not create the sector',
        'SECTOR_CREATE_FAILED',
        error
      );
    }

    return this.findOne(data.id);
  }

  async update(
    authUser: AuthUser,
    idSector: string,
    payload: UpdateSectorDto
  ): Promise<SectorDto> {
    const point = toPoint(payload);

    const { error } = await userClient(authUser)
      .from('sectors')
      .update({
        name: payload.name,
        description: payload.description ?? '',
        lat: point.lat,
        lng: point.lng
      })
      .eq('id', idSector);

    if (error) {
      throw writeFailed(
        'Could not save the sector',
        'SECTOR_UPDATE_FAILED',
        error
      );
    }

    return this.findOne(idSector);
  }

  async climberContent(idSector: string): Promise<ClimberContentDto> {
    return countClimberContent(publicSupabase(), { idSector });
  }

  async remove(authUser: AuthUser, idSector: string): Promise<void> {
    return archiveRow(userClient(authUser), TARGET, idSector);
  }

  async restore(authUser: AuthUser, idSector: string): Promise<SectorDto> {
    await restoreRow(userClient(authUser), TARGET, idSector);

    return this.findOne(idSector);
  }

  async purge(authUser: AuthUser, idSector: string): Promise<void> {
    return eraseArchivedRow(userClient(authUser), TARGET, idSector);
  }
}

const toSectorDto = (row: SectorRow): SectorDto => ({
  id: row.id,
  idRegion: row.id_region,
  regionName: row.regions?.name ?? '',
  name: row.name,
  photoUrl: toPhotoUrl(row),
  description: row.description,
  lat: row.lat,
  lng: row.lng,
  routeCount: row.route_count,
  gradeMin: row.grade_min,
  gradeMinScale: row.grade_min_scale,
  gradeMax: row.grade_max,
  gradeMaxScale: row.grade_max_scale,
  gradeHistogram: row.grade_histogram,
  isArchived: row.is_archived,
  isDeleted: !!row.deleted_at
});

const toPoint = ({ lat, lng }: UpdateSectorDto): Coords => {
  if (lat == null || lng == null) return { lat: null, lng: null };

  const isInRange = lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  if (!isInRange) {
    throw new ValidationException(
      'A point needs a latitude of -90..90 and a longitude of -180..180',
      'SECTOR_POINT_OUT_OF_RANGE'
    );
  }

  return { lat, lng };
};

const toPhotoUrl = (row: SectorRow): string | null => {
  const [first] = [...row.topos].sort((a, b) => a.sort_order - b.sort_order);

  return first ? storagePublicUrl('topos', first.storage_path) : null;
};
