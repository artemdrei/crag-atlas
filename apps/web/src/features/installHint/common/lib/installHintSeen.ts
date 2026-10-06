const STORAGE_KEY = 'crag-atlas:install-hint-seen';

export const isInstallHintSeen = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return true;
  }
};

export const markInstallHintSeen = () => {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {}
};
