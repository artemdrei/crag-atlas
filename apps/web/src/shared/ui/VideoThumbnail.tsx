import { type SyntheticEvent, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { mediaThumbnailUrl } from '@web/shared/lib';

// YouTube answers a removed or private video with a 404 that still carries a
// grey 120×90 picture, so the browser renders it instead of firing onError.
const MISSING_THUMBNAIL_WIDTH = 120;

export interface Props {
  alt: string;
  idYoutube: string;
  className?: string;
}

export const VideoThumbnail = ({ alt, idYoutube, className }: Props) => {
  const [isMissing, setIsMissing] = useState(false);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    if (event.currentTarget.naturalWidth === MISSING_THUMBNAIL_WIDTH) {
      setIsMissing(true);
    }
  };

  if (isMissing) {
    return (
      <MissingStyled className={className}>
        <VideocamOffOutlinedIcon fontSize="small" color="disabled" />
        <Typography variant="caption" color="text.secondary">
          <Trans>Video unavailable</Trans>
        </Typography>
      </MissingStyled>
    );
  }

  return (
    <ImageStyled
      className={className}
      src={mediaThumbnailUrl({ id: idYoutube, url: '' })}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={handleLoad}
      onError={() => setIsMissing(true)}
    />
  );
};

const ImageStyled = styled('img')`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const MissingStyled = styled('div')`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.palette.background.paper};
`;
