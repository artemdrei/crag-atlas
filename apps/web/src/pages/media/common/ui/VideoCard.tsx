import type { ReactNode } from 'react';

import type { Video } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, keyframes, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { localNameOf } from '@web/shared/lib';
import { GradeText, HighlightedText, VideoThumbnail } from '@web/shared/ui';

export interface Props {
  video: Video;
  query: string;
  action?: ReactNode;
  isOwn: boolean;
  isHighlighted: boolean;
  onPlay: () => void;
}

export const VideoCard = ({
  video,
  query,
  action,
  isOwn,
  isHighlighted,
  onPlay
}: Props) => {
  const { t } = useLingui();
  const { route } = video;
  const isOwnLabel = isOwn && !video.channelName;
  const author = video.channelName || (isOwn ? t`You` : video.authorName);
  const local = localNameOf(route.name, route.nameLocal);
  const year = (video.publishedAt ?? video.createdAt).slice(0, 4);

  return (
    <CardStyled>
      <FrameStyled isHighlighted={isHighlighted}>
        <PlayAreaStyled aria-label={t`Play ${route.name}`} onClick={onPlay}>
          <VideoThumbnail alt={route.name} idYoutube={video.idYoutube} />
          <PlayBadgeStyled className="play-badge">
            <PlayArrowIcon />
          </PlayBadgeStyled>
        </PlayAreaStyled>
        {action && (
          <ActionSlotStyled className="video-action">{action}</ActionSlotStyled>
        )}
      </FrameStyled>
      <Typography variant="subtitle1" noWrap>
        <HighlightedText text={route.name} query={query} />
        {local && (
          <>
            {' ('}
            <HighlightedText text={local} query={query} />)
          </>
        )}{' '}
        <GradeText grade={route.grade} scale={route.gradeScale} />
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap>
        {author ? (
          <>
            {isOwnLabel ? (
              author
            ) : (
              <HighlightedText text={author} query={query} />
            )}
            {` · ${year}`}
          </>
        ) : (
          <Trans>Added {year}</Trans>
        )}
      </Typography>
    </CardStyled>
  );
};

const flash = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const CardStyled = styled('article')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  min-width: 0;
`;

const FrameStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isHighlighted'
})<{ isHighlighted: boolean }>`
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing(0.5)};
  border-radius: ${({ theme }) => Number(theme.shape.borderRadius) * 2}px;
  background: ${({ theme }) => theme.palette.action.hover};

  &:hover .video-action,
  &:focus-within .video-action {
    opacity: 1;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    box-shadow: inset 0 0 0 2px ${({ theme }) => theme.palette.primary.main};
    opacity: 0;
    animation: ${({ isHighlighted }) => (isHighlighted ? flash : 'none')} 3s
      ease-out;
  }
`;

const PlayAreaStyled = styled(ButtonBase)`
  width: 100%;
  height: 100%;

  &:hover .play-badge,
  &:focus-visible .play-badge {
    color: ${({ theme }) => theme.palette.primary.contrastText};
    background: ${({ theme }) => theme.palette.primary.main};
  }
`;

const PlayBadgeStyled = styled('span')`
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  color: ${({ theme }) => theme.palette.common.white};
  background: ${({ theme }) => alpha(theme.palette.common.black, 0.6)};
  transition: background-color 0.15s ease;
`;

const ActionSlotStyled = styled('div')`
  position: absolute;
  z-index: 2;
  top: ${({ theme }) => theme.spacing(0.75)};
  right: ${({ theme }) => theme.spacing(0.75)};
  transition: opacity 0.15s ease;

  @media (hover: hover) {
    opacity: 0;
  }
`;
