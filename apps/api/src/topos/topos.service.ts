import { Injectable } from '@nestjs/common';

import { AppException } from '../common/exceptions/app.exception';
import { publicSupabase, storagePublicUrl } from '../config/supabase.client';
import type { TopoDto } from './topos.types';

interface TopoRow {
  id: string;
  label: string;
  storage_path: string;
  route_lines: {
    id_route: string;
    points: number[][];
    routes: { name: string; grade: string } | null;
  }[];
}

@Injectable()
export class ToposService {
  async findBySector(idSector: string): Promise<TopoDto[]> {
    const { data, error } = await publicSupabase()
      .from('topos')
      .select(
        'id, label, storage_path, route_lines (id_route, points, routes (name, grade))'
      )
      .eq('id_sector', idSector)
      .order('sort_order')
      .returns<TopoRow[]>();

    if (error) {
      throw new AppException(
        error.message,
        500,
        error.code ?? 'TOPOS_READ_FAILED'
      );
    }

    return data.map((row) => ({
      id: row.id,
      label: row.label,
      // Built here, so the client never has to know the storage layout.
      photoUrl: storagePublicUrl('topos', row.storage_path),
      lines: row.route_lines.map((line) => ({
        idRoute: line.id_route,
        routeName: line.routes?.name ?? '',
        grade: line.routes?.grade ?? '',
        points: line.points
      }))
    }));
  }
}
