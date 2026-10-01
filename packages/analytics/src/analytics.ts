import type { AnalyticsEvent } from './events';

export interface AnalyticsSink {
  track: (name: string, props?: Record<string, unknown>) => void;
  identify: (idUser: string, userProps?: Record<string, unknown>) => void;
  reset: () => void;
  flush: () => void;
}

export interface IdentifyParams {
  idUser: string;
  email?: string;
}

const noopSink: AnalyticsSink = {
  track: () => {},
  identify: () => {},
  reset: () => {},
  flush: () => {}
};

let activeSink: AnalyticsSink = noopSink;

export const setAnalyticsSink = (sink: AnalyticsSink) => {
  activeSink = sink;
};

export const track = (event: AnalyticsEvent) => {
  activeSink.track(event.name, 'props' in event ? event.props : undefined);
};

export const identifyUser = ({ idUser, email }: IdentifyParams) => {
  const userProps: Record<string, unknown> = {};

  if (email) userProps.email = email;

  activeSink.identify(idUser, userProps);
};

// Events are batched, and a click handing the page to a maps app never goes
// through pagehide, so such a call site flushes its own event.
export const flushAnalytics = () => {
  activeSink.flush();
};

// reset(), not setUserId(null): the next anonymous session must not stay
// attributed to whoever just left.
export const resetAnalytics = () => {
  activeSink.reset();
};
