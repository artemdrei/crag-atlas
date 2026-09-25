import { useLingui } from '@lingui/react/macro';
import IconButton from '@mui/material/IconButton';

import { useModal } from '@web/app/providers';
import { MediaBadge } from '@web/shared/ui';

export interface Props {
  idRoute: string;
  hasPhoto: boolean;
  hasVideo: boolean;
}

export const RouteMediaButton = ({ idRoute, hasPhoto, hasVideo }: Props) => {
  const { t } = useLingui();
  const { openModal } = useModal();

  if (!hasPhoto && !hasVideo) return null;

  const open = () => openModal('ROUTE_MEDIA_VIEW', { idRoute });

  return (
    <IconButton size="small" aria-label={t`Video and photo`} onClick={open}>
      <MediaBadge hasPhoto={hasPhoto} hasVideo={hasVideo} />
    </IconButton>
  );
};
