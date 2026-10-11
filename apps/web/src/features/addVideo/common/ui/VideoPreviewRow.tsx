import type { VideoPreview } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { VideoThumbnail } from '@web/shared/ui';

export interface Props {
  preview: VideoPreview;
  onRemove: () => void;
}

export const VideoPreviewRow = ({ preview, onRemove }: Props) => {
  const { t } = useLingui();
  const title = preview.title ?? t`YouTube video`;

  return (
    <RowStyled>
      <ThumbStyled>
        <VideoThumbnail alt={title} idYoutube={preview.idYoutube} />
      </ThumbStyled>
      <TextStyled>
        <Typography variant="subtitle2" noWrap>
          {title}
        </Typography>
        {preview.channelName && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {preview.channelName}
          </Typography>
        )}
      </TextStyled>
      <IconButton size="small" aria-label={t`Remove`} onClick={onRemove}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </RowStyled>
  );
};

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: ${({ theme }) => theme.palette.action.hover};
`;

const ThumbStyled = styled('div')`
  flex: 0 0 auto;
  width: 96px;
  height: 54px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const TextStyled = styled('div')`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
`;
