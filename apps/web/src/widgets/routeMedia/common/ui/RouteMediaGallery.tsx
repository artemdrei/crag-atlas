import { useState } from 'react';

import type { RouteMedia } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  formatDateTime,
  isSafeHttpUrl,
  mediaEmbedUrl,
  mediaThumbnailOf,
  parseMediaLink
} from '@web/shared/lib';

import { useApiGetRouteMedia } from '../hooks';

export interface Props {
  idRoute: string;
  idMedia?: string;
}

export const RouteMediaGallery = ({ idRoute, idMedia }: Props) => {
  const { i18n, t } = useLingui();
  const { media, isLoading } = useApiGetRouteMedia(idRoute);
  const [idActive, setIdActive] = useState(idMedia);

  // Opened from a row that only knows the route carries media.
  const active = media.find(({ id }) => id === idActive) ?? media[0];

  if (isLoading) return null;

  if (!active) {
    return (
      <Typography variant="body2" color="text.secondary">
        <Trans>This media is gone.</Trans>
      </Typography>
    );
  }

  const labelOf = (item: RouteMedia) => {
    const kin = media.filter(({ kind }) => kind === item.kind);
    const position = kin.indexOf(item) + 1;

    return item.kind === 'video' ? t`Video ${position}` : t`Photo ${position}`;
  };

  return (
    <GalleryStyled>
      <CaptionStyled variant="body2" color="text.secondary">
        {creditOf(active, i18n.locale)}
      </CaptionStyled>

      <StageStyled>
        <MediaStage item={active} title={labelOf(active)} />
      </StageStyled>

      {media.length > 1 && (
        <StripStyled>
          {media.map((item) => {
            const thumbnail = mediaThumbnailOf(item);

            return (
              <ThumbStyled
                key={item.id}
                isActive={item.id === active.id}
                onClick={() => setIdActive(item.id)}
              >
                <ThumbFrameStyled>
                  {thumbnail ? (
                    <ThumbImageStyled
                      src={thumbnail}
                      alt={labelOf(item)}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <PlayArrowIcon fontSize="small" />
                  )}
                </ThumbFrameStyled>
                <ThumbLabelStyled variant="caption" noWrap>
                  {item.authorName}
                </ThumbLabelStyled>
                <ThumbCreditStyled variant="caption" noWrap>
                  {formatDateTime(item.createdAt, i18n.locale)}
                </ThumbCreditStyled>
              </ThumbStyled>
            );
          })}
        </StripStyled>
      )}
    </GalleryStyled>
  );
};

interface MediaStageProps {
  item: RouteMedia;
  title: string;
}

const MediaStage = ({ item, title }: MediaStageProps) => {
  if (item.kind === 'photo') {
    return (
      <PhotoStyled
        src={isSafeHttpUrl(item.url) ? item.url : undefined}
        alt={title}
      />
    );
  }

  const link = parseMediaLink(item.url);

  if (!link) {
    return (
      <Typography variant="body2">
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.url}
        </a>
      </Typography>
    );
  }

  return (
    <FrameStyled
      src={mediaEmbedUrl(link)}
      title={title}
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      // Someone else's page: it may run its player, but must not reach this
      // app's storage, forms or navigation.
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
};

const creditOf = (item: RouteMedia, locale: string) =>
  [item.authorName, formatDateTime(item.createdAt, locale)]
    .filter(Boolean)
    .join(' · ');

const GalleryStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  min-width: 0;
`;

const StageStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
`;

const FrameStyled = styled('iframe')`
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: ${({ theme }) => theme.palette.action.hover};
`;

const PhotoStyled = styled('img')`
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const CaptionStyled = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing(-1)};
`;

const StripStyled = styled('div')`
  display: flex;
  flex: 0 0 auto;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-bottom: ${({ theme }) => theme.spacing(0.5)};

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ThumbStyled = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'isActive'
})<{ isActive: boolean }>`
  flex: 0 0 auto;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing(0.5)};
  width: 120px;
  text-align: left;
  padding: ${({ theme }) => theme.spacing(0.5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 2px solid
    ${({ theme, isActive }) =>
      isActive ? theme.palette.primary.main : 'transparent'};
  opacity: ${({ isActive }) => (isActive ? 1 : 0.6)};
`;

const ThumbFrameStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  color: ${({ theme }) => theme.palette.text.secondary};
  background: ${({ theme }) => theme.palette.action.hover};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  overflow: hidden;
`;

const ThumbImageStyled = styled('img')`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ThumbLabelStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const ThumbCreditStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.disabled};
`;
