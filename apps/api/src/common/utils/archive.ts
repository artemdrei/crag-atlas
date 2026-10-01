import type { SupabaseClient } from '@supabase/supabase-js';

import { AppException, NotFoundException } from '../exceptions/app.exception';
import { isReferenced, writeFailed } from '../exceptions/database.exception';

// Names the table and the `<ENTITY>_*` half of every error code it raises.
export interface ArchiveTarget {
  table: 'regions' | 'sectors' | 'routes';
  entity: 'REGION' | 'SECTOR' | 'ROUTE';
  noun: string;
}

const setArchived = async (
  client: SupabaseClient,
  { table, entity, noun }: ArchiveTarget,
  id: string,
  isArchived: boolean
): Promise<void> => {
  const update = client
    .from(table)
    .update({ deleted_at: isArchived ? new Date().toISOString() : null })
    .eq('id', id);

  const { data, error } = await (isArchived
    ? update.is('deleted_at', null)
    : update.not('deleted_at', 'is', null)
  )
    .select('id')
    .maybeSingle<{ id: string }>();

  if (error) {
    throw writeFailed(
      `Could not ${isArchived ? 'archive' : 'restore'} the ${noun}`,
      `${entity}_${isArchived ? 'DELETE' : 'RESTORE'}_FAILED`,
      error
    );
  }

  if (!data) {
    throw new NotFoundException(
      `${noun} "${id}" not found`,
      `${entity}_NOT_FOUND`
    );
  }
};

export const archiveRow = (
  client: SupabaseClient,
  target: ArchiveTarget,
  id: string
): Promise<void> => setArchived(client, target, id, true);

export const restoreRow = (
  client: SupabaseClient,
  target: ArchiveTarget,
  id: string
): Promise<void> => setArchived(client, target, id, false);

export const eraseArchivedRow = async (
  client: SupabaseClient,
  { table, entity, noun }: ArchiveTarget,
  id: string
): Promise<void> => {
  const { data, error } = await client
    .from(table)
    .delete()
    .eq('id', id)
    .not('deleted_at', 'is', null)
    .select('id')
    .maybeSingle<{ id: string }>();

  if (isReferenced(error ?? undefined)) {
    throw new AppException(
      `Climbers' ascents, comments or media still point at this ${noun}`,
      409,
      `${entity}_HAS_CONTENT`
    );
  }

  if (error) {
    throw writeFailed(
      `Could not erase the ${noun}`,
      `${entity}_PURGE_FAILED`,
      error
    );
  }

  if (!data) {
    throw new NotFoundException(
      `${noun} "${id}" is not in the archive`,
      `${entity}_NOT_ARCHIVED`
    );
  }
};
