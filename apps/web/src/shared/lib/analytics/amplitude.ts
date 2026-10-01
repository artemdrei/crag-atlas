import { isMobile } from 'react-device-detect';

import {
  add,
  flush,
  Identify,
  identify,
  init,
  reset,
  setTransport,
  setUserId,
  type Types,
  track
} from '@amplitude/analytics-browser';
import type { AuthState } from '@crag-atlas/analytics';
import { setAnalyticsSink } from '@crag-atlas/analytics';

import { sleep } from '../sleep';
import { normalizePath } from './normalizePath';
import { normalizeUrl } from './normalizeUrl';

const RESET_FLUSH_TIMEOUT_MS = 2000;

// 'unknown' until the session is restored: those first events must not report
// a member as a guest.
let authState: AuthState = 'unknown';

export const setAnalyticsAuthState = (isAuthenticated: boolean) => {
  authState = isAuthenticated ? 'member' : 'guest';
};

// The attribution plugin writes these as whole urls, where pageUrlEnrichment
// never looks.
const REFERRER_KEYS = ['referrer', 'initial_referrer'];

const normalizeReferrers = (bag: unknown) => {
  if (!bag || typeof bag !== 'object') return;

  const record = bag as Record<string, unknown>;

  for (const key of REFERRER_KEYS) {
    const value = record[key];

    if (typeof value === 'string') record[key] = normalizeUrl(value);
  }
};

// pageUrlEnrichment:false strips url props from track() events only;
// autocaptured ones still carry the raw location.
const normalizeUrlPropsPlugin: Types.EnrichmentPlugin = {
  name: 'normalize-url-props',
  type: 'enrichment',
  setup: async () => undefined,
  execute: async (event) => {
    const props = event.event_properties as Record<string, unknown> | undefined;

    if (props) {
      delete props['[Amplitude] Page URL'];
      delete props['[Amplitude] Page Location'];
      delete props['[Amplitude] Previous Page Location'];

      const path = props['[Amplitude] Page Path'];

      if (typeof path === 'string') {
        props['[Amplitude] Page Path'] = normalizePath(path);
      }

      normalizeReferrers(props);
    }

    // initial_referrer is set once and never recovers.
    const user = event.user_properties as Record<string, unknown> | undefined;

    normalizeReferrers(user);
    normalizeReferrers(user?.$set);
    normalizeReferrers(user?.$setOnce);

    return event;
  }
};

// Both variants are the same browser, so Amplitude's own platform property
// cannot tell them apart.
const stampSurfacePlugin: Types.EnrichmentPlugin = {
  name: 'stamp-surface',
  type: 'enrichment',
  setup: async () => undefined,
  execute: async (event) => {
    event.event_properties = {
      ...event.event_properties,
      app_surface: isMobile ? 'mobile' : 'desktop',
      auth_state: authState
    };

    return event;
  }
};

// The key is the only gate: a production build is not a reason on its own,
// because the e2e suite runs against exactly such a build.
export const initAmplitude = () => {
  const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY;

  if (!apiKey) return;

  init(apiKey, {
    fetchRemoteConfig: false,
    flushIntervalMillis: 10_000,
    autocapture: {
      elementInteractions: false,
      pageViews: false,
      formInteractions: false,
      fileDownloads: false,
      pageUrlEnrichment: false,
      sessions: true,
      attribution: {
        // The event-property plugin runs after every enrichment plugin, so
        // the raw url it stamps is past the reach of the normalization above.
        trackingMethod: 'userProperty',
        excludeInternalReferrers: true,
        // Our own OAuth hop is not internal, and would land in the
        // set-once initial_referrer.
        excludeReferrers: ['accounts.google.com']
      }
    }
  });

  add(normalizeUrlPropsPlugin);
  add(stampSurfacePlugin);

  // Login Attempted is sent right before the OAuth redirect, and leaving the
  // page kills the in-flight request.
  addEventListener('pagehide', () => {
    setTransport('beacon');
    flush();
  });

  // pagehide also fires into the bfcache and setTransport is permanent, so on
  // Back this context would keep using sendBeacon, which drops payloads >64KB.
  addEventListener('pageshow', () => setTransport('fetch'));

  setAnalyticsSink({
    track: (name, props) => {
      track(name, props);
    },
    flush: () => {
      flush();
    },
    identify: (idUser, userProps) => {
      setUserId(idUser);

      const props = new Identify();

      Object.entries(userProps ?? {}).forEach(([key, value]) => {
        props.set(key, value as string);
      });

      identify(props);
    },
    // The SDK stamps user_id when a queued event executes, so a synchronous
    // reset() would ship Logged Out anonymous. Capped against a hung request.
    reset: async () => {
      await Promise.race([flush().promise, sleep(RESET_FLUSH_TIMEOUT_MS)]);

      reset();
    }
  });
};
