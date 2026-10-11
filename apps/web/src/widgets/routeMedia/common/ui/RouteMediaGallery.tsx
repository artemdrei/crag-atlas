import type { RouteMedia } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  isSafeHttpUrl,
  mediaEmbedUrl,
  mediaThumbnailOf,
  parseMediaLink
} from '@web/shared/lib';

import { mediaCreditOf } from '../lib';

export interface Props {
  media: RouteMedia[];
  active: RouteMedia | undefined;
  isLoading: boolean;
  select: (idMedia: string) => void;
}

export const RouteMediaGallery = ({
  media,
  active,
  isLoading,
  select
}: Props) => {
  const { t } = useLingui();

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
      <StageStyled>
        <MediaStage item={active} title={labelOf(active)} />
      </StageStyled>

      {media.length > 1 && (
        <StripStyled>
          {media.map((item) => {
            const thumbnail = mediaThumbnailOf(item);
            const { author, date } = mediaCreditOf(item);

            return (
              <ThumbStyled
                key={item.id}
                isActive={item.id === active.id}
                onClick={() => select(item.id)}
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
                <ThumbTextStyled>
                  <ThumbLabelStyled variant="caption" noWrap>
                    {author}
                  </ThumbLabelStyled>
                  <ThumbCreditStyled variant="caption" noWrap>
                    {date}
                  </ThumbCreditStyled>
                </ThumbTextStyled>
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

const StripStyled = styled('div')`
  display: flex;
  flex: 0 0 auto;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding: ${({ theme }) => theme.spacing(1.5)};
  scrollbar-width: none;
  margin: ${({ theme }) => theme.spacing(0, -1.5)};
  padding: ${({ theme }) => theme.spacing(1, 1.5, 1.5)};

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
  width: 88px;
  text-align: left;
  padding: ${({ theme }) => theme.spacing(0.5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 2px solid
    ${({ theme, isActive }) =>
      isActive ? theme.palette.primary.main : 'transparent'};
  background: ${({ theme, isActive }) =>
    isActive ? theme.palette.action.selected : 'transparent'};
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

const ThumbTextStyled = styled('div')`
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.3;

  & > * {
    line-height: inherit;
  }
`;

const ThumbLabelStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.primary};
`;

const ThumbCreditStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;
