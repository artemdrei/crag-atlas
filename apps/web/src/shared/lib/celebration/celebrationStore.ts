import { useSyncExternalStore } from 'react';

export type CelebrationName = 'confetti';

type Listener = () => void;

let current: CelebrationName | null = null;
const listeners = new Set<Listener>();

const emit = () => {
  for (const listener of listeners) listener();
};

const subscribe = (listener: Listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const celebrate = (name: CelebrationName) => {
  if (current) return;
  current = name;
  emit();
};

export const endCelebration = () => {
  current = null;
  emit();
};

export const useCelebration = () =>
  useSyncExternalStore(
    subscribe,
    () => current,
    () => null
  );
