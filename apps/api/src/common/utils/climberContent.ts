import type { SupabaseClient } from '@supabase/supabase-js';

import type { ClimberContentDto } from '../dto/climberContent.dto';
import { readFailed } from '../exceptions/database.exception';

export interface ClimberContentScope {
  idRegion?: string;
  idSector?: string;
  idRoute?: string;
}

export const countClimberContent = async (
  client: SupabaseClient,
  scope: ClimberContentScope
): Promise<ClimberContentDto> => {
  const { data, error } = await client.rpc('climber_content', {
    id_region: scope.idRegion ?? null,
    id_sector: scope.idSector ?? null,
    id_route: scope.idRoute ?? null
  });

  if (error) {
    throw readFailed(
      'Could not count what climbers left here',
      'CLIMBER_CONTENT_READ_FAILED',
      error
    );
  }

  return data as ClimberContentDto;
};
