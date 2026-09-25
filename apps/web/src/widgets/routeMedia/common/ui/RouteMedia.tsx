import { Trans, useLingui } from '@lingui/react/macro';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useModal } from '@web/app/providers';
import { isSafeHttpUrl } from '@web/shared/lib';
import { ApiFeedback } from '@web/shared/ui';

import { useApiGetRouteMedia, useRouteMediaPermissions } from '../hooks';

export interface Props {
  idRoute: string;
}

export const RouteMedia = ({ idRoute }: Props) => {
  const { t } = useLingui();
  const { media, isLoading, failure } = useApiGetRouteMedia(idRoute);
  const { canDelete } = useRouteMediaPermissions();
  const { openModal } = useModal();

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
        <ItemStyled key={item.id}>
          <CardStyled
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
          {canDelete(item.idUser) && (
            // A sibling of the card, not a child: a button inside an anchor
            // is invalid and the anchor swallows its clicks.
            <RemoveButtonStyled
              size="small"
              aria-label={t`Delete media`}
              onClick={() =>
                openModal('ROUTE_MEDIA_DELETE', { idRoute, idMedia: item.id })
              }
            >
              <DeleteOutlinedIcon fontSize="small" />
            </RemoveButtonStyled>
          )}
        </ItemStyled>
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

const ItemStyled = styled('div')`
  position: relative;
  flex: 0 0 auto;
`;

const CardStyled = styled('a')`
  display: block;
  width: 240px;
  color: inherit;
  text-decoration: none;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  overflow: hidden;
`;

const RemoveButtonStyled = styled(IconButton)`
  position: absolute;
  top: ${({ theme }) => theme.spacing(0.5)};
  right: ${({ theme }) => theme.spacing(0.5)};
  color: ${({ theme }) => theme.palette.text.secondary};
  background: ${({ theme }) => theme.palette.background.paper};

  &:hover {
    color: ${({ theme }) => theme.palette.error.contrastText};
    background: ${({ theme }) => theme.palette.error.main};
  }
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
