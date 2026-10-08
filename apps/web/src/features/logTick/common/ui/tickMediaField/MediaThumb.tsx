import { useLingui } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

import {
  mediaThumbnailUrl,
  parseMediaLink,
  useObjectUrl
} from '@web/shared/lib';

export interface Props {
  label: string;
  photoUrl?: string;
  videoUrl?: string;
  onRemove?: () => void;
}

export const MediaThumb = ({ label, photoUrl, videoUrl, onRemove }: Props) => {
  const { t } = useLingui();
  const link = videoUrl ? parseMediaLink(videoUrl) : undefined;
  const src = photoUrl ?? (link && mediaThumbnailUrl(link));

  return (
    <ThumbStyled title={label}>
      {src && <ImageStyled src={src} alt={label} />}
      {videoUrl && (
        <PlayBadgeStyled>
          <PlayArrowRoundedIcon fontSize="small" />
        </PlayBadgeStyled>
      )}
      {onRemove && (
        <RemoveStyled size="small" aria-label={t`Remove`} onClick={onRemove}>
          <CloseIcon fontSize="inherit" />
        </RemoveStyled>
      )}
    </ThumbStyled>
  );
};

export interface FileThumbProps {
  file: File;
  onRemove: () => void;
}

export const FileThumb = ({ file, onRemove }: FileThumbProps) => (
  <MediaThumb
    label={file.name}
    photoUrl={useObjectUrl(file) || undefined}
    onRemove={onRemove}
  />
);

export const THUMB_SIZE = 72;

const ThumbStyled = styled('div')`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${THUMB_SIZE}px;
  height: ${THUMB_SIZE}px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background: ${({ theme }) => theme.palette.action.hover};
`;

const ImageStyled = styled('img')`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlayBadgeStyled = styled('span')`
  position: absolute;
  left: ${({ theme }) => theme.spacing(0.5)};
  bottom: ${({ theme }) => theme.spacing(0.5)};
  display: flex;
  border-radius: 50%;
  background: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.text.primary};
`;

const RemoveStyled = styled(IconButton)`
  position: absolute;
  top: ${({ theme }) => theme.spacing(0.25)};
  right: ${({ theme }) => theme.spacing(0.25)};
  padding: 2px;
  font-size: 14px;
  background: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.text.primary};

  &:hover {
    background: ${({ theme }) => theme.palette.background.paper};
  }
`;
