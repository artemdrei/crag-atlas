import { Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  AppException,
  NotFoundException,
  ValidationException
} from '../common/exceptions/app.exception';
import {
  readFailed,
  writeFailed
} from '../common/exceptions/database.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { freeSlug, isSlug, toSlug } from '../common/utils/slug';
import { userClient } from '../common/utils/userClient';
import { publicSupabase } from '../config/supabase.client';
import type { QrPathTargetDto, SectorQrDto } from './qrPaths.types';

const COLUMNS =
  'id, id_region, name, name_local, deleted_at, regions!inner (id, name, country, qr_slug, deleted_at), sector_qr_paths (path, is_current, created_at)';

// Raised by `set_sector_qr_path()` in 018_sector_qr_paths.sql.
const QR_PATH_TAKEN = 'CA003';

interface RegionRow {
  id: string;
  name: string;
  country: string | null;
  qr_slug: string | null;
  deleted_at: string | null;
}

interface SectorQrRow {
  id: string;
  id_region: string;
  name: string;
  name_local: string | null;
  deleted_at: string | null;
  regions: RegionRow;
  sector_qr_paths: { path: string; is_current: boolean; created_at: string }[];
}

interface QrFilter {
  idRegion?: string;
  idSector?: string;
  idSectors?: string[];
}

@Injectable()
export class QrPathsService {
  async list(authUser: AuthUser, filter: QrFilter): Promise<SectorQrDto[]> {
    const rows = await this.rowsOf(userClient(authUser), filter);

    return rows.map(toSectorQrDto).sort(byRegionThenSector);
  }

  async create(
    authUser: AuthUser,
    idSectors: string[]
  ): Promise<SectorQrDto[]> {
    const client = userClient(authUser);
    const rows = await this.rowsOf(client, { idSectors });

    for (const row of rows) {
      const hasPath = row.sector_qr_paths.some(({ is_current }) => is_current);

      if (hasPath || !row.regions.country) continue;

      const prefix = await this.prefixOf(client, row.regions);
      const taken = await this.pathsUnder(client, prefix);
      const slug = freeSlug(toSlug(row.name), (candidate) =>
        taken.has(`${prefix}${candidate}`)
      );

      await this.setPath(client, row.id, `${prefix}${slug}`);
    }

    return this.list(authUser, { idSectors });
  }

  async setSlug(
    authUser: AuthUser,
    idSector: string,
    slug: string
  ): Promise<SectorQrDto> {
    const trimmed = slug?.trim() ?? '';

    if (!isSlug(trimmed)) {
      throw new ValidationException(
        'A slug is lowercase Latin letters and digits joined by single hyphens',
        'QR_SLUG_INVALID'
      );
    }

    const client = userClient(authUser);
    const [row] = await this.rowsOf(client, { idSector });

    if (!row) {
      throw new NotFoundException(
        `Sector "${idSector}" not found`,
        'SECTOR_NOT_FOUND'
      );
    }

    if (!row.regions.country) {
      throw new ValidationException(
        'The region needs a country before its sectors get a QR code',
        'QR_REGION_COUNTRY_MISSING'
      );
    }

    const prefix = await this.prefixOf(client, row.regions);

    await this.setPath(client, idSector, `${prefix}${trimmed}`);

    const [updated = row] = await this.rowsOf(client, { idSector });

    return toSectorQrDto(updated);
  }

  async resolve(path: string): Promise<QrPathTargetDto> {
    const normalized = (path ?? '')
      .trim()
      .toLowerCase()
      .replace(/^\/+|\/+$/g, '');

    const { data, error } = await publicSupabase()
      .from('sector_qr_paths')
      .select('id_sector, sectors (id_region)')
      .eq('path', normalized)
      .maybeSingle<{ id_sector: string; sectors: { id_region: string } }>();

    if (error) {
      throw readFailed(
        'Could not read the QR code',
        'QR_PATH_READ_FAILED',
        error
      );
    }

    if (!data) {
      throw new NotFoundException(
        `QR path "${normalized}" not found`,
        'QR_PATH_NOT_FOUND'
      );
    }

    return { idRegion: data.sectors.id_region, idSector: data.id_sector };
  }

  private async rowsOf(
    client: SupabaseClient,
    { idRegion, idSector, idSectors }: QrFilter
  ): Promise<SectorQrRow[]> {
    let query = client.from('sectors').select(COLUMNS);

    if (idRegion) query = query.eq('id_region', idRegion);
    if (idSector) query = query.eq('id', idSector);
    if (idSectors) query = query.in('id', idSectors);

    const { data, error } = await query.returns<SectorQrRow[]>();

    if (error) {
      throw readFailed(
        'Could not load the QR codes',
        'QR_PATHS_READ_FAILED',
        error
      );
    }

    return data;
  }

  // The region part is written once and kept: a renamed region must not move
  // the paths its sectors already printed.
  private async prefixOf(
    client: SupabaseClient,
    region: RegionRow
  ): Promise<string> {
    const country = region.country?.toLowerCase() ?? '';

    if (region.qr_slug) return `${country}/${region.qr_slug}/`;

    const { data: siblings, error } = await client
      .from('regions')
      .select('qr_slug')
      .eq('country', region.country)
      .not('qr_slug', 'is', null)
      .returns<{ qr_slug: string }[]>();

    if (error) {
      throw readFailed(
        'Could not load the regions',
        'QR_REGIONS_READ_FAILED',
        error
      );
    }

    const taken = new Set(siblings.map(({ qr_slug }) => qr_slug));
    const slug = freeSlug(toSlug(region.name), (candidate) =>
      taken.has(candidate)
    );

    // `is null` keeps a slug another admin set a moment ago; the read below
    // returns whichever one won.
    const { error: updateError } = await client
      .from('regions')
      .update({ qr_slug: slug })
      .eq('id', region.id)
      .is('qr_slug', null);

    if (updateError) {
      throw writeFailed(
        'Could not save the region QR slug',
        'QR_REGION_SLUG_WRITE_FAILED',
        updateError
      );
    }

    const { data: saved, error: readError } = await client
      .from('regions')
      .select('qr_slug')
      .eq('id', region.id)
      .single<{ qr_slug: string }>();

    if (readError) {
      throw readFailed(
        'Could not load the region',
        'QR_REGION_READ_FAILED',
        readError
      );
    }

    return `${country}/${saved.qr_slug}/`;
  }

  private async pathsUnder(
    client: SupabaseClient,
    prefix: string
  ): Promise<Set<string>> {
    const { data, error } = await client
      .from('sector_qr_paths')
      .select('path')
      .like('path', `${prefix}%`)
      .returns<{ path: string }[]>();

    if (error) {
      throw readFailed(
        'Could not load the QR codes',
        'QR_PATHS_READ_FAILED',
        error
      );
    }

    return new Set(data.map(({ path }) => path));
  }

  private async setPath(
    client: SupabaseClient,
    idSector: string,
    path: string
  ): Promise<void> {
    const { error } = await client.rpc('set_sector_qr_path', {
      target: idSector,
      new_path: path
    });

    if (error?.code === QR_PATH_TAKEN) {
      throw new AppException(
        'Another sector already uses this address',
        409,
        'QR_PATH_TAKEN'
      );
    }

    if (error) {
      throw writeFailed(
        'Could not save the QR code',
        'QR_PATH_WRITE_FAILED',
        error
      );
    }
  }
}

const toSectorQrDto = (row: SectorQrRow): SectorQrDto => {
  const paths = [...row.sector_qr_paths].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );

  return {
    idSector: row.id,
    idRegion: row.id_region,
    regionName: row.regions.name,
    country: row.regions.country,
    sectorName: row.name,
    sectorNameLocal: row.name_local,
    isArchived: !!row.deleted_at || !!row.regions.deleted_at,
    path: paths.find(({ is_current }) => is_current)?.path ?? null,
    oldPaths: paths
      .filter(({ is_current }) => !is_current)
      .map(({ path }) => path)
  };
};

const byRegionThenSector = (a: SectorQrDto, b: SectorQrDto) =>
  a.regionName.localeCompare(b.regionName) ||
  a.sectorName.localeCompare(b.sectorName);
