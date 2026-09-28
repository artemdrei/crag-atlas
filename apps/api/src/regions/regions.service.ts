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
import {
  findPhotosUnder,
  removeCatalogPhotos
} from '../common/utils/catalogPhotos';
import { countClimberContent } from '../common/utils/climberContent';
import type { GradeScale } from '../common/utils/grade';
import { toLatinName, toLocalName } from '../common/utils/names';
import type { UploadedPhoto } from '../common/utils/photoStorage';
import {
  assertWebp,
  buildPhotoPath,
  removePhoto,
  uploadPhoto
} from '../common/utils/photoStorage';
import { toPoint } from '../common/utils/point';
import { userClient } from '../common/utils/userClient';
import { publicSupabase, storagePublicUrl } from '../config/supabase.client';

const REGIONS_BUCKET = 'regions';

import type {
  CreateRegionDto,
  RegionDto,
  UpdateRegionDto
} from './regions.types';

// Counts and grade ranges are derived, so reads come from the view and writes
// go to the table underneath it.
const COLUMNS =
  'id, name, name_local, country, rock_type, lat, lng, photo_path, sector_count, route_count, grade_min, grade_min_scale, grade_max, grade_max_scale, grade_histogram, is_archived, deleted_at';

interface RegionRow {
  id: string;
  name: string;
  name_local: string | null;
  country: string | null;
  rock_type: string;
  lat: number | null;
  lng: number | null;
  photo_path: string | null;
  sector_count: number;
  route_count: number;
  grade_min: string | null;
  grade_min_scale: GradeScale | null;
  grade_max: string | null;
  grade_max_scale: GradeScale | null;
  grade_histogram: GradeHistogramGroupDto[];
  is_archived: boolean;
  deleted_at: string | null;
}

// The picker sends a code, but nothing stops a client from sending anything;
// the column's own check would answer with a write error nobody can read.
const normalizeCountry = (country?: string | null): string | null => {
  const code = country?.trim().toUpperCase();

  if (!code) {
    return null;
  }

  if (!/^[A-Z]{2}$/.test(code)) {
    throw new ValidationException(
      'A country is an ISO 3166-1 alpha-2 code',
      'REGION_COUNTRY_INVALID'
    );
  }

  return code;
};

const TARGET: ArchiveTarget = {
  table: 'regions',
  entity: 'REGION',
  noun: 'region'
};

@Injectable()
export class RegionsService {
  async findAll(isArchiveOnly = false): Promise<RegionDto[]> {
    const query = publicSupabase()
      .from('regions_with_stats')
      .select(COLUMNS)
      .order('name');

    const { data, error } = await (isArchiveOnly
      ? query.not('deleted_at', 'is', null)
      : query.is('deleted_at', null)
    ).returns<RegionRow[]>();

    if (error) {
      throw readFailed(
        'Could not load the regions',
        'REGIONS_READ_FAILED',
        error
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
      throw readFailed(
        'Could not load the region',
        'REGION_READ_FAILED',
        error
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

  async create(
    authUser: AuthUser,
    payload: CreateRegionDto
  ): Promise<RegionDto> {
    const { data, error } = await userClient(authUser)
      .from('regions')
      .insert({
        name: toLatinName(payload.name, TARGET.entity),
        name_local: toLocalName(payload.nameLocal),
        country: normalizeCountry(payload.country),
        rock_type: payload.rockType?.trim() ?? '',
        ...toPoint(payload, TARGET.entity)
      })
      .select('id')
      .single<{ id: string }>();

    if (error) {
      throw writeFailed(
        'Could not create the region',
        'REGION_CREATE_FAILED',
        error
      );
    }

    return this.findOne(data.id);
  }

  async replacePhoto(
    authUser: AuthUser,
    idRegion: string,
    photo: UploadedPhoto
  ): Promise<RegionDto> {
    assertWebp(photo);

    const client = userClient(authUser);
    const path = buildPhotoPath(idRegion);

    const { data: current } = await client
      .from('regions')
      .select('photo_path')
      .eq('id', idRegion)
      .maybeSingle<{ photo_path: string | null }>();

    await uploadPhoto(client, REGIONS_BUCKET, path, photo);

    const { data, error } = await client
      .from('regions')
      .update({ photo_path: path })
      .eq('id', idRegion)
      .select('id')
      .maybeSingle<{ id: string }>();

    // RLS answers a refused write with no row, so the just-uploaded object
    // would sit in the bucket unreferenced.
    if (error || !data) {
      await removePhoto(client, REGIONS_BUCKET, path);

      if (error) {
        throw writeFailed(
          'Could not attach the photo to the region',
          'REGION_PHOTO_FAILED',
          error
        );
      }

      throw new NotFoundException(
        `Region "${idRegion}" not found`,
        'REGION_NOT_FOUND'
      );
    }

    // The bucket is public, so a cover left behind stays downloadable by
    // anyone who ever saw its URL.
    if (current?.photo_path) {
      await removePhoto(client, REGIONS_BUCKET, current.photo_path);
    }

    return this.findOne(idRegion);
  }

  async update(
    authUser: AuthUser,
    idRegion: string,
    payload: UpdateRegionDto
  ): Promise<RegionDto> {
    const { error } = await userClient(authUser)
      .from('regions')
      .update({
        name: toLatinName(payload.name, TARGET.entity),
        name_local: toLocalName(payload.nameLocal),
        country: normalizeCountry(payload.country),
        rock_type: payload.rockType,
        ...toPoint(payload, TARGET.entity)
      })
      .eq('id', idRegion);

    if (error) {
      throw writeFailed(
        'Could not save the region',
        'REGION_UPDATE_FAILED',
        error
      );
    }

    return this.findOne(idRegion);
  }

  async climberContent(idRegion: string): Promise<ClimberContentDto> {
    return countClimberContent(publicSupabase(), { idRegion });
  }

  async remove(authUser: AuthUser, idRegion: string): Promise<void> {
    return archiveRow(userClient(authUser), TARGET, idRegion);
  }

  async restore(authUser: AuthUser, idRegion: string): Promise<RegionDto> {
    await restoreRow(userClient(authUser), TARGET, idRegion);

    return this.findOne(idRegion);
  }

  async purge(authUser: AuthUser, idRegion: string): Promise<void> {
    const client = userClient(authUser);
    // Read before the erase: the rows below carry the only reference to their
    // files, and a cascade deletes them without telling storage.
    const photos = await findPhotosUnder(client, { idRegion });

    await eraseArchivedRow(client, TARGET, idRegion);
    await removeCatalogPhotos(client, photos);
  }
}

const toRegionDto = (row: RegionRow): RegionDto => ({
  id: row.id,
  name: row.name,
  nameLocal: row.name_local,
  country: row.country,
  rockType: row.rock_type,
  lat: row.lat,
  lng: row.lng,
  photoUrl: row.photo_path
    ? storagePublicUrl(REGIONS_BUCKET, row.photo_path)
    : null,
  sectorCount: row.sector_count,
  routeCount: row.route_count,
  gradeMin: row.grade_min,
  gradeMinScale: row.grade_min_scale,
  gradeMax: row.grade_max,
  gradeMaxScale: row.grade_max_scale,
  gradeHistogram: row.grade_histogram,
  isArchived: row.is_archived,
  isDeleted: !!row.deleted_at
});
