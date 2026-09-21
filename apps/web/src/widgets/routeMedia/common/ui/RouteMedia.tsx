import { Trans } from '@lingui/react/macro';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { isSafeHttpUrl } from '@web/shared/lib';
import { ApiFeedback } from '@web/shared/ui';

import { useApiGetRouteMedia } from '../hooks';

export interface Props {
  idRoute: string;
}

export const RouteMedia = ({ idRoute }: Props) => {
  const { media, isLoading, failure } = useApiGetRouteMedia(idRoute);

  return (
    <StripStyled>
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading media…</Trans>}
      />
      {!isLoading && media.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          <Trans>No videos or photos yet.</Trans>
        </Typography>
      )}
      {media.map((item) => (
        <CardStyled
          key={item.id}
          href={isSafeHttpUrl(item.url) ? item.url : undefined}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ThumbnailStyled>
            {item.kind === 'video' && <PlayArrowIcon fontSize="large" />}
          </ThumbnailStyled>
          <CaptionStyled>
            <Typography variant="subtitle2" noWrap>
              {item.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {[item.authorName, formatDuration(item.durationSeconds)]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          </CaptionStyled>
        </CardStyled>
      ))}
    </StripStyled>
  );
};

const formatDuration = (seconds?: number | null) => {
  if (!seconds) return '';

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

const StripStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: ${({ theme }) => theme.spacing(0.5)};

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CardStyled = styled('a')`
  flex: 0 0 auto;
  width: 240px;
  color: inherit;
  text-decoration: none;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  overflow: hidden;
`;

const ThumbnailStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 10;
  color: ${({ theme }) => theme.palette.text.secondary};
  background: ${({ theme }) => theme.palette.action.hover};
`;

const CaptionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(1, 1.5, 1.5)};
`;
