import { OfflineShortcutLinks, useOfflineShortcuts } from '../common';

export interface Props {
  isCatalogUnavailable: boolean;
}

export const OfflineShortcutsMobile = ({ isCatalogUnavailable }: Props) => {
  const { isVisible, links } = useOfflineShortcuts(isCatalogUnavailable);

  if (!isVisible) return null;

  return <OfflineShortcutLinks links={links} />;
};
