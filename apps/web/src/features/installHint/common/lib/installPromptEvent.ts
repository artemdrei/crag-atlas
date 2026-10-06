interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) listener();
};

// Chromium fires this once, early, and only to a listener already attached;
// it is caught at module load so the hint can still offer it later.
addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferred = event as BeforeInstallPromptEvent;
  notify();
});

addEventListener('appinstalled', () => {
  deferred = null;
  notify();
});

export const subscribeInstallPrompt = (onChange: () => void) => {
  listeners.add(onChange);

  return () => {
    listeners.delete(onChange);
  };
};

export const getInstallPrompt = () => deferred;

export const consumeInstallPrompt = () => {
  const event = deferred;
  deferred = null;
  notify();

  return event;
};
