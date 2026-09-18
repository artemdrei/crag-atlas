export interface ReporterSink {
  error: (error: unknown, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
}

const noopSink: ReporterSink = {
  error: () => {},
  warn: () => {},
  info: () => {}
};

let activeSink: ReporterSink = noopSink;

// Swap in a real sink (Sentry, etc.) once one exists — call sites never
// change, only this wiring does.
export const setReporterSink = (sink: ReporterSink) => {
  activeSink = sink;
};

export const reporter: ReporterSink = {
  error: (error, context) => activeSink.error(error, context),
  warn: (message, context) => activeSink.warn(message, context),
  info: (message, context) => activeSink.info(message, context)
};
