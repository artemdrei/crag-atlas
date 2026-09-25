import { useLingui } from '@lingui/react/macro';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

export interface Props {
  hasPhoto: boolean;
  hasVideo: boolean;
}

export const MediaBadge = ({ hasPhoto, hasVideo }: Props) => {
  const { t } = useLingui();

  if (hasVideo) {
    return <VideoLibraryIcon fontSize="small" titleAccess={t`Has video`} />;
  }

  if (hasPhoto) {
    return <ImageOutlinedIcon fontSize="small" titleAccess={t`Has photo`} />;
  }

  return null;
};
