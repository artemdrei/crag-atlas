import { OfflineShortcutLinks, useOfflineShortcuts } from '../common';

export const OfflineShortcutsMobile = () => {
  const { isVisible, links } = useOfflineShortcuts();

  if (!isVisible) return null;

  return <OfflineShortcutLinks links={links} />;
};
