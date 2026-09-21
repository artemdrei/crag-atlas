import { Injectable } from '@nestjs/common';

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
import type { GradeScale } from '../common/utils/grade';
import type { UploadedPhoto } from '../common/utils/photoStorage';
import {
  assertWebp,
  buildPhotoPath,
  removePhoto,
  uploadPhoto
} from '../common/utils/photoStorage';
import { userClient } from '../common/utils/userClient';
import { publicSupabase, storagePublicUrl } from '../config/supabase.client';

export const REGIONS_BUCKET = 'regions';

import type {
  CreateRegionDto,
  RegionDto,
  UpdateRegionDto
} from './regions.types';

// Counts and grade ranges are derived, so reads come from the view and writes
// go to the table underneath it.
const COLUMNS =
  'id, name, province, rock_type, photo_path, sector_count, route_count, grade_min, grade_min_scale, grade_max, grade_max_scale';

interface RegionRow {
  id: string;
  name: string;
  province: string;
  rock_type: string;
  photo_path: string | null;
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
    const name = payload.name?.trim() ?? '';

    if (!name) {
      throw new ValidationException('A name is required', 'REGION_NAME_EMPTY');
    }

    const { data, error } = await userClient(authUser)
      .from('regions')
      .insert({
        name,
        province: payload.province?.trim() ?? '',
        rock_type: payload.rockType?.trim() ?? ''
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

      throw new AppException(
        error?.message ?? 'Region not found',
        error ? 400 : 404,
        error?.code ?? 'REGION_PHOTO_FAILED'
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
        name: payload.name,
        province: payload.province,
        rock_type: payload.rockType
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
}

const toRegionDto = (row: RegionRow): RegionDto => ({
  id: row.id,
  name: row.name,
  province: row.province,
  rockType: row.rock_type,
  photoUrl: row.photo_path
    ? storagePublicUrl(REGIONS_BUCKET, row.photo_path)
    : null,
  sectorCount: row.sector_count,
  routeCount: row.route_count,
  gradeMin: row.grade_min,
  gradeMinScale: row.grade_min_scale,
  gradeMax: row.grade_max,
  gradeMaxScale: row.grade_max_scale
});
