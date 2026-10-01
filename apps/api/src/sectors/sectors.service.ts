import { Injectable } from '@nestjs/common';

import type { ClimberContentDto } from '../common/dto/climberContent.dto';
import type { GradeHistogramGroupDto } from '../common/dto/gradeHistogram.dto';
import { NotFoundException } from '../common/exceptions/app.exception';
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
import {
  findPhotosUnder,
  removeCatalogPhotos
} from '../common/utils/catalogPhotos';
import { countClimberContent } from '../common/utils/climberContent';
import type { GradeScale } from '../common/utils/grade';
import { toLatinName, toLocalName } from '../common/utils/names';
import { toPoint } from '../common/utils/point';
import { userClient } from '../common/utils/userClient';
import { publicSupabase, storagePublicUrl } from '../config/supabase.client';
import type {
  CreateSectorDto,
  SectorDto,
  SectorTickCountDto,
  UpdateSectorDto
} from './sectors.types';

// The region name rides along: ids are uuids, so a page opened by URL would
// have no breadcrumb label.
const COLUMNS =
  'id, id_region, name, name_local, description, lat, lng, route_count, grade_min, grade_min_scale, grade_max, grade_max_scale, grade_histogram, is_archived, deleted_at, regions (name), topos (storage_path, sort_order)';

interface TickedRow {
  id_route: string;
  routes: { id_sector: string };
}

interface SectorRow {
  id: string;
  id_region: string;
  name: string;
  name_local: string | null;
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

    // An archived region's page still lists what it held, and its archive
    // holds the sectors deleted from it.
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

  // Counted the way `route_count` is, so a card never shows more ascents than
  // it has routes.
  async findTickedByRegion(
    authUser: AuthUser,
    idRegion: string
  ): Promise<SectorTickCountDto[]> {
    const { data, error } = await userClient(authUser)
      .from('ticks')
      .select(
        'id_route, routes!inner (id_sector, deleted_at, sectors!inner (id_region))'
      )
      .eq('id_user', authUser.idUser)
      .eq('routes.sectors.id_region', idRegion)
      .is('routes.deleted_at', null)
      .neq('ascent_type', 'attempt')
      .returns<TickedRow[]>();

    if (error) {
      throw readFailed(
        'Could not load your ascents',
        'SECTORS_TICKED_READ_FAILED',
        error
      );
    }

    const routesBySector = new Map<string, Set<string>>();

    for (const row of data) {
      const idSector = row.routes.id_sector;
      const routes = routesBySector.get(idSector) ?? new Set<string>();

      routes.add(row.id_route);
      routesBySector.set(idSector, routes);
    }

    return [...routesBySector].map(([idSector, routes]) => ({
      idSector,
      tickedCount: routes.size
    }));
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
    const { data, error } = await userClient(authUser)
      .from('sectors')
      .insert({
        id_region: idRegion,
        name: toLatinName(payload.name, TARGET.entity),
        name_local: toLocalName(payload.nameLocal),
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
    const { error } = await userClient(authUser)
      .from('sectors')
      .update({
        name: toLatinName(payload.name, TARGET.entity),
        name_local: toLocalName(payload.nameLocal),
        description: payload.description ?? '',
        ...toPoint(payload, TARGET.entity)
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
    const client = userClient(authUser);
    // Read before the erase: a cascade deletes the rows without telling
    // storage.
    const photos = await findPhotosUnder(client, { idSector });

    await eraseArchivedRow(client, TARGET, idSector);
    await removeCatalogPhotos(client, photos);
  }
}

const toSectorDto = (row: SectorRow): SectorDto => ({
  id: row.id,
  idRegion: row.id_region,
  regionName: row.regions?.name ?? '',
  name: row.name,
  nameLocal: row.name_local,
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

const toPhotoUrl = (row: SectorRow): string | null => {
  const [first] = [...row.topos].sort((a, b) => a.sort_order - b.sort_order);

  return first ? storagePublicUrl('topos', first.storage_path) : null;
};
