import { Injectable, Logger } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';

import { AppException } from '../common/exceptions/app.exception';
import {
  readFailed,
  writeFailed
} from '../common/exceptions/database.exception';
import { publicSupabase, serviceSupabase } from '../config/supabase.client';
import type { Point } from './horizon.geometry';
import {
  aspectFromRing,
  aspectSamples,
  destination,
  elevationAngle,
  horizonSamples,
  RADII_M,
  SAMPLE_AZIMUTH_STEP,
  toProfile
} from './horizon.geometry';
import type { HorizonBackfillDto } from './horizon.types';

const ELEVATION_URL = 'https://api.open-meteo.com/v1/elevation';

// The provider's own limit on one request.
const BATCH_SIZE = 100;

// It counts coordinates, not requests: six hundred a minute, five thousand
// an hour. The pause spreads a sector's batches out so a build never fills
// the minute on its own — the forecast calls the conditions card is waiting
// on draw from the same budget.
const PAUSE_MS = 20_000;

// Once refused, nothing gets through until the minute turns over. An hourly
// refusal is not worth waiting out inside a request: the sector stays queued
// and the next read picks it up.
const RATE_LIMIT_PAUSE_MS = 60_000;
const MINUTE_LIMIT_HINT = 'Minutely';
const LIMIT_HINT = 'limit exceeded';

// One sector per call, because one sector is one minute. The caller repeats
// while `remaining` is above zero.
const BACKFILL_BATCH = 1;

const SOURCE = 'open-meteo-glo90';

export interface HorizonRow {
  id_sector: string;
  profile: number[] | null;
  elevation_m: number | null;
  aspect_deg: number | null;
  computed_at: string | null;
}

interface PendingRow {
  id_sector: string;
  sectors: { lat: number | null; lng: number | null } | null;
}

@Injectable()
export class HorizonService {
  private readonly logger = new Logger(HorizonService.name);
  private readonly pending = new Set<string>();
  private chain: Promise<void> = Promise.resolve();

  private writer(): SupabaseClient | null {
    const client = serviceSupabase();

    if (!client) {
      this.logger.warn('No service key is configured, so no skyline is built');
    }

    return client;
  }

  async find(idSector: string): Promise<HorizonRow | null> {
    const { data, error } = await publicSupabase()
      .from('sector_horizon')
      .select('id_sector, profile, elevation_m, aspect_deg, computed_at')
      .eq('id_sector', idSector)
      .maybeSingle<HorizonRow>();

    if (error) {
      throw readFailed(
        'Could not load the skyline',
        'HORIZON_READ_FAILED',
        error
      );
    }

    return data;
  }

  // Queues rather than computes: the caller is an admin waiting on a PATCH,
  // and a skyline is a minute of calls to the elevation provider.
  async queue(idSector: string): Promise<void> {
    const client = this.writer();

    if (!client) return;

    const { error } = await client.from('sector_horizon').upsert(
      {
        id_sector: idSector,
        profile: null,
        computed_at: null,
        failed_at: null
      },
      { onConflict: 'id_sector' }
    );

    if (error) {
      throw writeFailed(
        'Could not queue the skyline',
        'HORIZON_QUEUE_FAILED',
        error
      );
    }
  }

  async drop(idSector: string): Promise<void> {
    const client = this.writer();

    if (!client) return;

    const { error } = await client
      .from('sector_horizon')
      .delete()
      .eq('id_sector', idSector);

    if (error) {
      throw writeFailed(
        'Could not clear the skyline',
        'HORIZON_QUEUE_FAILED',
        error
      );
    }
  }

  // Fire-and-forget: the sector is saved either way, and a skyline that
  // failed stays queued for the next read or the backfill to pick up.
  async queueAndBuild(idSector: string): Promise<void> {
    await this.queue(idSector);

    void this.build(idSector);
  }

  // What a read of a sector calls when the profile is missing. Nothing is
  // awaited — the card renders with a flat horizon now and the real skyline
  // the next time it is opened.
  buildWhenMissing(row: HorizonRow | null, idSector: string): void {
    if (row?.computed_at) return;

    void this.build(idSector);
  }

  private async build(idSector: string): Promise<void> {
    // The provider counts coordinates against one shared budget, so two
    // sectors built at once would refuse each other. They queue instead.
    if (this.pending.has(idSector)) return;

    this.pending.add(idSector);

    this.chain = this.chain
      .then(() => this.buildNow(idSector))
      .catch((cause) =>
        this.logger.warn(
          `Skyline for sector ${idSector} left queued: ${String(cause)}`
        )
      )
      .finally(() => {
        this.pending.delete(idSector);
      });

    return this.chain;
  }

  private async buildNow(idSector: string): Promise<void> {
    const client = this.writer();

    if (!client) return;

    const { data, error } = await client
      .from('sectors')
      .select('lat, lng')
      .eq('id', idSector)
      .is('deleted_at', null)
      .maybeSingle<{ lat: number | null; lng: number | null }>();

    if (error) {
      throw readFailed(
        'Could not load the sector',
        'HORIZON_READ_FAILED',
        error
      );
    }

    if (data?.lat == null || data.lng == null) {
      await this.drop(idSector);

      return;
    }

    await this.write(client, idSector, { lat: data.lat, lng: data.lng });
  }

  async backfill(): Promise<HorizonBackfillDto> {
    const client = this.writer();

    if (!client) {
      throw new AppException(
        'No service key is configured, so no skyline can be built',
        503,
        'HORIZON_NO_SERVICE_KEY'
      );
    }

    const { data, error, count } = await client
      .from('sector_horizon')
      .select('id_sector, sectors (lat, lng)', { count: 'exact' })
      .is('computed_at', null)
      .order('created_at')
      .limit(BACKFILL_BATCH)
      .returns<PendingRow[]>();

    if (error) {
      throw readFailed(
        'Could not load the skyline queue',
        'HORIZON_READ_FAILED',
        error
      );
    }

    let built = 0;
    let failed = 0;
    let failureCode: string | null = null;

    for (const row of data) {
      const { lat, lng } = row.sectors ?? {};

      if (lat == null || lng == null) {
        await this.drop(row.id_sector);
        continue;
      }

      try {
        await this.write(client, row.id_sector, { lat, lng });
        built += 1;
      } catch (cause) {
        failed += 1;
        failureCode ??=
          cause instanceof AppException ? (cause.code ?? null) : 'UNKNOWN';
        await this.markFailed(client, row.id_sector);
      }
    }

    return {
      built,
      failed,
      failureCode,
      remaining: Math.max(0, (count ?? data.length) - built)
    };
  }

  private async write(
    client: SupabaseClient,
    idSector: string,
    point: Point
  ): Promise<void> {
    const samples = horizonSamples();
    const ring = aspectSamples();
    const heights = await elevations([
      point,
      ...[...samples, ...ring].map((sample) => destination(point, sample))
    ]);

    const [baseM = 0, ...rest] = heights;
    const skyline = rest.slice(0, samples.length);
    const ringM = rest.slice(samples.length);

    const anglesByRay = Array.from(
      { length: 360 / SAMPLE_AZIMUTH_STEP },
      (_, ray) =>
        Math.max(
          ...RADII_M.map((distanceM, radius) =>
            elevationAngle(
              baseM,
              skyline[ray * RADII_M.length + radius] ?? baseM,
              distanceM
            )
          )
        )
    );

    const { error } = await client.from('sector_horizon').upsert(
      {
        id_sector: idSector,
        profile: toProfile(anglesByRay),
        elevation_m: Math.round(baseM),
        aspect_deg: aspectFromRing(baseM, ringM),
        source: SOURCE,
        computed_at: new Date().toISOString(),
        failed_at: null
      },
      { onConflict: 'id_sector' }
    );

    if (error) {
      throw writeFailed(
        'Could not save the skyline',
        'HORIZON_SAVE_FAILED',
        error
      );
    }
  }

  private async markFailed(client: SupabaseClient, idSector: string) {
    await client
      .from('sector_horizon')
      .update({ failed_at: new Date().toISOString() })
      .eq('id_sector', idSector);
  }
}

const elevations = async (points: Point[]): Promise<number[]> => {
  const heights: number[] = [];

  for (let from = 0; from < points.length; from += BATCH_SIZE) {
    const batch = points.slice(from, from + BATCH_SIZE);
    const url = new URL(ELEVATION_URL);

    url.search = new URLSearchParams({
      latitude: batch.map((point) => point.lat.toFixed(5)).join(','),
      longitude: batch.map((point) => point.lng.toFixed(5)).join(',')
    }).toString();

    heights.push(...(await request(url)));

    if (from + BATCH_SIZE < points.length) await pause(PAUSE_MS);
  }

  return heights;
};

const pause = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

interface ElevationResponse {
  elevation?: (number | null)[];
  error?: boolean;
  reason?: string;
}

// Retried once, after the minute the provider asked for: a build that walked
// into someone else's burst should wait rather than leave the sector queued.
const request = async (url: URL, isRetry = false): Promise<number[]> => {
  let response: Response;

  try {
    response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  } catch (cause) {
    throw new AppException(
      `The elevation provider is unreachable: ${String(cause)}`,
      502,
      'HORIZON_FETCH_FAILED'
    );
  }

  const body = (await response.json()) as ElevationResponse;

  if (!response.ok || body.error || !body.elevation) {
    const reason = body.reason ?? String(response.status);

    if (
      !isRetry &&
      reason.includes(LIMIT_HINT) &&
      reason.includes(MINUTE_LIMIT_HINT)
    ) {
      await pause(RATE_LIMIT_PAUSE_MS);

      return request(url, true);
    }

    throw new AppException(
      `The elevation provider refused the request: ${reason}`,
      502,
      'HORIZON_FETCH_FAILED'
    );
  }

  // Sea is answered as null, and sea level is what it is.
  return body.elevation.map((height) => height ?? 0);
};
