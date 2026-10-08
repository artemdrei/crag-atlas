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
import type { Shelter } from '../common/utils/shelter';
import { limitedDescription } from '../common/utils/textLimits';
import { userClient } from '../common/utils/userClient';
import { publicSupabase, storagePublicUrl } from '../config/supabase.client';
import { HorizonService } from '../horizon/horizon.service';
import type {
  CreateSectorDto,
  SectorDto,
  SectorListItemDto,
  SectorRouteDto,
  SectorTickCountDto,
  UpdateSectorDto
} from './sectors.types';

// The region name rides along: ids are uuids, so a page opened by URL would
// have no breadcrumb label.
const COLUMNS =
  'id, id_region, name, name_local, description, lat, lng, aspect_deg, shelter, route_count, grade_min, grade_min_scale, grade_max, grade_max_scale, grade_histogram, is_archived, deleted_at, regions (name), topos (storage_path, sort_order)';

// Must not exceed `max_rows` in supabase/config.toml: a page the server cuts
// short would read as the last one.
const ROUTE_PAGE_SIZE = 1000;

const ROUTE_COLUMNS =
  'id, id_sector, name, grade, grade_scale, type, length, rating, ascents_count_total';

interface SectorRouteRow {
  id: string;
  id_sector: string;
  name: string;
  grade: string;
  grade_scale: GradeScale;
  type: SectorRouteDto['type'];
  length: number | null;
  rating: number | null;
  ascents_count_total: number | null;
}

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
  aspect_deg: number | null;
  shelter: Shelter;
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
  constructor(private readonly horizonService: HorizonService) {}

  async findByRegion(
    idRegion: string,
    isArchiveOnly = false
  ): Promise<SectorListItemDto[]> {
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

    const routesOf = isArchiveOnly
      ? new Map<string, SectorRouteDto[]>()
      : await this.findRoutesOf(data.map(({ id }) => id));

    return data.map((row) => ({
      ...toSectorDto(row),
      routes: routesOf.get(row.id) ?? []
    }));
  }

  private async findRoutesOf(
    idSectors: string[]
  ): Promise<Map<string, SectorRouteDto[]>> {
    const routesOf = new Map<string, SectorRouteDto[]>();

    if (idSectors.length === 0) return routesOf;

    const rows: SectorRouteRow[] = [];

    for (let from = 0; ; from += ROUTE_PAGE_SIZE) {
      const { data, error } = await publicSupabase()
        .from('routes_with_stats')
        .select(ROUTE_COLUMNS)
        .in('id_sector', idSectors)
        .is('deleted_at', null)
        .order('name')
        .order('id')
        .range(from, from + ROUTE_PAGE_SIZE - 1)
        .returns<SectorRouteRow[]>();

      if (error) {
        throw readFailed(
          'Could not load the routes',
          'ROUTES_READ_FAILED',
          error
        );
      }

      rows.push(...data);

      if (data.length < ROUTE_PAGE_SIZE) break;
    }

    for (const row of rows) {
      const routes = routesOf.get(row.id_sector) ?? [];

      routes.push(toSectorRouteDto(row));
      routesOf.set(row.id_sector, routes);
    }

    return routesOf;
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
      tickedCount: routes.size,
      idRoutes: [...routes]
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
        description: limitedDescription(payload.description)
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
    const before = await this.point(idSector);
    const point = toPoint(payload, TARGET.entity);

    const { error } = await userClient(authUser)
      .from('sectors')
      .update({
        name: toLatinName(payload.name, TARGET.entity),
        name_local: toLocalName(payload.nameLocal),
        description: limitedDescription(payload.description),
        aspect_deg: payload.aspectDeg ?? null,
        ...(payload.shelter ? { shelter: payload.shelter } : {}),
        ...point
      })
      .eq('id', idSector);

    if (error) {
      throw writeFailed(
        'Could not save the sector',
        'SECTOR_UPDATE_FAILED',
        error
      );
    }

    // The skyline is read from the ground around the pin, so moving the pin
    // invalidates it. Queued and built behind the answer: a profile is dozens
    // of calls to the elevation provider and the admin is waiting on a save.
    if (before.lat !== point.lat || before.lng !== point.lng) {
      await this.horizonService.queueAndBuild(idSector);
    }

    return this.findOne(idSector);
  }

  // Only the pin is read here, not the whole sector: `findOne` goes through
  // the stats view, which aggregates every route and joins the region.
  private async point(idSector: string): Promise<SectorPoint> {
    const { data, error } = await publicSupabase()
      .from('sectors')
      .select('lat, lng')
      .eq('id', idSector)
      .is('deleted_at', null)
      .maybeSingle<SectorPoint>();

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

    return data;
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

interface SectorPoint {
  lat: number | null;
  lng: number | null;
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
  aspectDeg: row.aspect_deg,
  shelter: row.shelter,
  routeCount: row.route_count,
  gradeMin: row.grade_min,
  gradeMinScale: row.grade_min_scale,
  gradeMax: row.grade_max,
  gradeMaxScale: row.grade_max_scale,
  gradeHistogram: row.grade_histogram,
  isArchived: row.is_archived,
  isDeleted: !!row.deleted_at
});

const toSectorRouteDto = (row: SectorRouteRow): SectorRouteDto => ({
  id: row.id,
  name: row.name,
  grade: row.grade,
  gradeScale: row.grade_scale,
  type: row.type,
  length: row.length,
  rating: row.rating,
  ascentsCount: row.ascents_count_total
});

const toPhotoUrl = (row: SectorRow): string | null => {
  const [first] = [...row.topos].sort((a, b) => a.sort_order - b.sort_order);

  return first ? storagePublicUrl('topos', first.storage_path) : null;
};
