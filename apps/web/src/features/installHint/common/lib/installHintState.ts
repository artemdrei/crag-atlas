export interface InstallHintState {
  firstSeenAt?: number;
  lastSessionAt?: number;
  sessionsCount: number;
  momentAt?: number;
  shownAt?: number;
  shownCount: number;
  isInstalled?: boolean;
}

const STORAGE_KEY = 'crag-atlas:install-hint';
const DAY_MS = 24 * 60 * 60 * 1000;
const RETURNING_AFTER_MS = DAY_MS;
const RETURNING_SESSIONS = 2;
const SHOW_COOLDOWN_MS = 3 * DAY_MS;
const MAX_SHOWN = 5;

const EMPTY: InstallHintState = { sessionsCount: 0, shownCount: 0 };

const listeners = new Set<() => void>();
let cached: InstallHintState | null = null;

const load = (): InstallHintState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
};

const read = (): InstallHintState => {
  cached ??= load();

  return cached;
};

const write = (patch: Partial<InstallHintState>) => {
  cached = { ...read(), ...patch };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch {}

  for (const listener of listeners) listener();
};

export const subscribeInstallHintState = (onChange: () => void) => {
  listeners.add(onChange);

  return () => {
    listeners.delete(onChange);
  };
};

export const getInstallHintState = read;

const isSameDay = (a: number, b: number) =>
  new Date(a).toDateString() === new Date(b).toDateString();

export const recordInstallHintSession = (now = Date.now()) => {
  const { firstSeenAt, lastSessionAt, sessionsCount } = read();

  if (lastSessionAt && isSameDay(lastSessionAt, now)) return;

  write({
    firstSeenAt: firstSeenAt ?? now,
    lastSessionAt: now,
    sessionsCount: sessionsCount + 1
  });
};

export const recordInstallHintMoment = (now = Date.now()) => {
  if (read().momentAt) return;

  write({ momentAt: now });
};

export const recordInstallHintShown = (now = Date.now()) =>
  write({ shownAt: now, shownCount: read().shownCount + 1 });

export const markInstallHintInstalled = () => write({ isInstalled: true });

export const shouldShowInstallHint = (
  state: InstallHintState,
  now = Date.now()
) => {
  if (state.isInstalled || !state.momentAt || !state.firstSeenAt) return false;
  if (state.shownCount >= MAX_SHOWN) return false;

  const isReturning =
    state.sessionsCount >= RETURNING_SESSIONS &&
    now - state.firstSeenAt >= RETURNING_AFTER_MS;
  const isCoolingDown =
    !!state.shownAt && now - state.shownAt < SHOW_COOLDOWN_MS;

  return isReturning && !isCoolingDown;
};
