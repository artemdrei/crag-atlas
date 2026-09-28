import { Injectable } from '@nestjs/common';

import { readFailed } from '../common/exceptions/database.exception';
import { publicSupabase } from '../config/supabase.client';
import type { CatalogSearchDto } from './search.types';

// Below three characters pg_trgm has no full trigram to look up, so the
// search falls back to a sequential scan of every catalog table at once.
const MIN_SEARCH_LENGTH = 3;
const MAX_ROWS = 5;

const EMPTY: CatalogSearchDto = { regions: [], sectors: [], routes: [] };

@Injectable()
export class SearchService {
  async search(query?: string): Promise<CatalogSearchDto> {
    const term = query?.trim() ?? '';

    if (term.length < MIN_SEARCH_LENGTH) {
      return EMPTY;
    }

    const { data, error } = await publicSupabase().rpc('catalog_search', {
      term,
      max_rows: MAX_ROWS
    });

    if (error) {
      throw readFailed(
        'Could not search the catalog',
        'CATALOG_SEARCH_FAILED',
        error
      );
    }

    return data as CatalogSearchDto;
  }
}
