import { Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';

import { ValidationException } from '../common/exceptions/app.exception';
import type { DatabaseError } from '../common/exceptions/database.exception';
import { writeFailed } from '../common/exceptions/database.exception';
import {
  type TickWeatherRow,
  toWeatherColumns,
  type WeatherEntry
} from './weather.mapper';
import { WEATHER_SOURCES } from './weather.types';

@Injectable()
export class WeatherService {
  async save(
    client: SupabaseClient,
    entry: WeatherEntry
  ): Promise<TickWeatherRow> {
    assertSource(entry.weather.source);

    const { data, error } = await client
      .from('tick_weather')
      .upsert(toWeatherColumns(entry), { onConflict: 'id_tick' })
      .select('*')
      .single<TickWeatherRow>();

    if (error) throw saveFailed(error);

    return data;
  }

  async clear(client: SupabaseClient, idTick: string) {
    const { error } = await client
      .from('tick_weather')
      .delete()
      .eq('id_tick', idTick);

    if (error) {
      throw writeFailed(
        'Could not clear the conditions',
        'TICK_WEATHER_SAVE_FAILED',
        error
      );
    }
  }
}

// The column's check would refuse it too, with an unreadable write error.
const assertSource = (source: string | null | undefined) => {
  if (source == null) return;

  if (!(WEATHER_SOURCES as readonly string[]).includes(source)) {
    throw new ValidationException(
      `Unknown weather source "${source}"`,
      'TICK_WEATHER_SOURCE_UNKNOWN'
    );
  }
};

const saveFailed = (cause?: DatabaseError) =>
  writeFailed(
    'Could not save the conditions',
    'TICK_WEATHER_SAVE_FAILED',
    cause
  );
