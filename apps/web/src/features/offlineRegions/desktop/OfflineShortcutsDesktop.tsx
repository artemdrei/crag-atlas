import { OfflineShortcutLinks, useOfflineShortcuts } from '../common';

export const OfflineShortcutsDesktop = () => {
  const { isVisible, links } = useOfflineShortcuts();

  if (!isVisible) return null;

  return <OfflineShortcutLinks links={links} />;
};
