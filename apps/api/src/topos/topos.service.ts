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
import {
  assertWebp,
  buildPhotoPath,
  removePhoto,
  type UploadedPhoto,
  uploadPhoto
} from '../common/utils/photoStorage';
import { userClient } from '../common/utils/userClient';
import { publicSupabase, storagePublicUrl } from '../config/supabase.client';
import type { ReorderToposDto, TopoDto, UpdateTopoDto } from './topos.types';

export const TOPOS_BUCKET = 'topos';

const COLUMNS =
  'id, id_sector, label, storage_path, sort_order, width, height, route_lines (id_route, id_topo, points, bolts, anchor, label_offset_x, label_offset_y, routes (name, grade, grade_scale))';

interface TopoRow {
  id: string;
  id_sector: string;
  label: string;
  storage_path: string;
  sort_order: number;
  width: number | null;
  height: number | null;
  route_lines: {
    id_route: string;
    id_topo: string;
    points: number[][];
    bolts: number[][] | null;
    anchor: number[] | null;
    label_offset_x: number;
    label_offset_y: number;
    routes: { name: string; grade: string; grade_scale: GradeScale } | null;
  }[];
}

@Injectable()
export class ToposService {
  async findBySector(idSector: string): Promise<TopoDto[]> {
    const { data, error } = await publicSupabase()
      .from('topos')
      .select(COLUMNS)
      .eq('id_sector', idSector)
      .order('sort_order')
      .returns<TopoRow[]>();

    if (error) {
      throw readFailed('Could not load the photos', 'TOPOS_READ_FAILED', error);
    }

    return data.map(toTopoDto);
  }

  async create(
    authUser: AuthUser,
    idSector: string,
    photo: UploadedPhoto,
    label: string,
    width: number,
    height: number
  ): Promise<TopoDto> {
    assertWebp(photo);

    const client = userClient(authUser);
    const path = buildPhotoPath(idSector);
    // Before the upload: a throw here must not orphan the stored file.
    const sortOrder = await this.nextSortOrder(idSector);

    await uploadPhoto(client, TOPOS_BUCKET, path, photo);

    const { data, error } = await client
      .from('topos')
      .insert({
        id_sector: idSector,
        storage_path: path,
        label,
        width,
        height,
        sort_order: sortOrder
      })
      .select(COLUMNS)
      .single<TopoRow>();

    if (error) {
      await removePhoto(client, TOPOS_BUCKET, path);

      throw writeFailed('Could not add the photo', 'TOPO_CREATE_FAILED', error);
    }

    return toTopoDto(data);
  }

  async update(
    authUser: AuthUser,
    idTopo: string,
    payload: UpdateTopoDto
  ): Promise<TopoDto> {
    const { error } = await userClient(authUser)
      .from('topos')
      .update({ label: payload.label?.trim() ?? '' })
      .eq('id', idTopo);

    if (error) {
      throw writeFailed(
        'Could not save the photo',
        'TOPO_UPDATE_FAILED',
        error
      );
    }

    return this.findOne(idTopo);
  }

  /** The lines stay: different proportions are an adjustment, not a reason
   * to throw the geometry away. */
  async replacePhoto(
    authUser: AuthUser,
    idTopo: string,
    photo: UploadedPhoto,
    width: number,
    height: number
  ): Promise<TopoDto> {
    assertWebp(photo);

    const current = await this.findRow(idTopo);
    const client = userClient(authUser);
    const path = buildPhotoPath(current.id_sector);

    await uploadPhoto(client, TOPOS_BUCKET, path, photo);

    const { error } = await client
      .from('topos')
      .update({ storage_path: path, width, height })
      .eq('id', idTopo);

    if (error) {
      await removePhoto(client, TOPOS_BUCKET, path);

      throw writeFailed(
        'Could not replace the photo',
        'TOPO_REPLACE_FAILED',
        error
      );
    }

    await removePhoto(client, TOPOS_BUCKET, current.storage_path);

    return this.findOne(idTopo);
  }

  async remove(
    authUser: AuthUser,
    idTopo: string,
    isForced: boolean
  ): Promise<void> {
    const current = await this.findRow(idTopo);

    if (current.route_lines.length > 0 && !isForced) {
      throw new AppException(
        'This photo still carries route lines',
        409,
        'TOPO_HAS_LINES',
        { linesCount: current.route_lines.length }
      );
    }

    const client = userClient(authUser);

    // Row first: a row pointing at a deleted object renders a broken image.
    const { error } = await client.from('topos').delete().eq('id', idTopo);

    if (error) {
      throw writeFailed(
        'Could not delete the photo',
        'TOPO_DELETE_FAILED',
        error
      );
    }

    await removePhoto(client, TOPOS_BUCKET, current.storage_path);
  }

  async reorder(
    authUser: AuthUser,
    idSector: string,
    payload: ReorderToposDto
  ): Promise<TopoDto[]> {
    const items = payload.items ?? [];

    if (items.length === 0) {
      throw new ValidationException('Nothing to reorder', 'TOPO_ORDER_EMPTY');
    }

    const client = userClient(authUser);

    for (const item of items) {
      const { error } = await client
        .from('topos')
        .update({ sort_order: item.sortOrder })
        .eq('id', item.idTopo)
        .eq('id_sector', idSector);

      if (error) {
        throw writeFailed(
          'Could not reorder the photos',
          'TOPO_REORDER_FAILED',
          error
        );
      }
    }

    return this.findBySector(idSector);
  }

  private async findOne(idTopo: string): Promise<TopoDto> {
    return toTopoDto(await this.findRow(idTopo));
  }

  private async findRow(idTopo: string): Promise<TopoRow> {
    const { data, error } = await publicSupabase()
      .from('topos')
      .select(COLUMNS)
      .eq('id', idTopo)
      .maybeSingle<TopoRow>();

    if (error) {
      throw readFailed('Could not load the photo', 'TOPO_READ_FAILED', error);
    }

    if (!data) {
      throw new NotFoundException(
        `Topo "${idTopo}" not found`,
        'TOPO_NOT_FOUND'
      );
    }

    return data;
  }

  private async nextSortOrder(idSector: string): Promise<number> {
    const { data, error } = await publicSupabase()
      .from('topos')
      .select('sort_order')
      .eq('id_sector', idSector)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle<{ sort_order: number }>();

    if (error) {
      throw readFailed(
        'Could not read the photo order',
        'TOPO_SORT_ORDER_FAILED',
        error
      );
    }

    return data ? data.sort_order + 1 : 0;
  }
}

const toTopoDto = (row: TopoRow): TopoDto => ({
  id: row.id,
  label: row.label,
  photoUrl: storagePublicUrl(TOPOS_BUCKET, row.storage_path),
  sortOrder: row.sort_order,
  width: row.width,
  height: row.height,
  lines: row.route_lines.map((line) => ({
    idRoute: line.id_route,
    idTopo: line.id_topo,
    routeName: line.routes?.name ?? '',
    grade: line.routes?.grade ?? '',
    gradeScale: line.routes?.grade_scale ?? 'french',
    points: line.points,
    bolts: line.bolts ?? [],
    anchor: line.anchor,
    labelOffsetX: line.label_offset_x,
    labelOffsetY: line.label_offset_y
  }))
});
