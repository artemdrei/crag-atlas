import { Trans, useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import IconButton from '@mui/material/IconButton';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useModal, useUser } from '@web/app/providers';
import { formatDateTime, mediaThumbnailOf } from '@web/shared/lib';
import { ApiFeedback, EmptyState } from '@web/shared/ui';

import { useApiGetRouteMedia, useRouteMediaPermissions } from '../hooks';
import { RouteMediaSkeleton } from './RouteMediaSkeleton';
import { TILE_RATIO, TILE_WIDTH } from './tile';

export interface Props {
  idRoute: string;
}

export const RouteMedia = ({ idRoute }: Props) => {
  const { i18n, t } = useLingui();
  const { media, isLoading, failure } = useApiGetRouteMedia(idRoute);
  const { canDelete } = useRouteMediaPermissions();
  const { isAuthenticated } = useUser();
  const { openModal } = useModal();

  const handleAdd = () => openModal('ROUTE_MEDIA_ADD', { idRoute });

  if (isLoading) return <RouteMediaSkeleton />;

  const addCard = isAuthenticated ? (
    <AddCardStyled type="button" onClick={handleAdd}>
      <AddIcon />
      <Typography variant="body2">
        <Trans>Add yours</Trans>
      </Typography>
    </AddCardStyled>
  ) : null;

  if (media.length === 0) {
    return (
      <SectionStyled>
        <ApiFeedback failure={failure} />
        <EmptyState
          icon={<ImageOutlinedIcon />}
          message={<Trans>No videos or photos yet.</Trans>}
          action={addCard}
        />
      </SectionStyled>
    );
  }

  return (
    <SectionStyled>
      <ApiFeedback failure={failure} />
      <StripStyled>
        {media.map((item) => {
          const thumbnail = mediaThumbnailOf(item);

          return (
            <ItemStyled key={item.id}>
              <CardStyled
                type="button"
                onClick={() =>
                  openModal('ROUTE_MEDIA_VIEW', { idRoute, idMedia: item.id })
                }
              >
                <ThumbnailStyled>
                  {thumbnail && <ImageStyled src={thumbnail} alt="" />}
                  {item.kind === 'video' ? (
                    <PlayBadgeStyled>
                      <PlayArrowIcon fontSize="large" />
                    </PlayBadgeStyled>
                  ) : (
                    !thumbnail && <ImageOutlinedIcon fontSize="large" />
                  )}
                </ThumbnailStyled>
                <CaptionStyled>
                  <Typography variant="subtitle2" noWrap>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {[
                      item.authorName,
                      formatDateTime(item.createdAt, i18n.locale),
                      formatDuration(item.durationSeconds)
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Typography>
                </CaptionStyled>
              </CardStyled>
              {canDelete(item.idUser) && (
                // A sibling of the card, not a child: buttons cannot nest.
                <RemoveButtonStyled
                  size="small"
                  aria-label={t`Delete media`}
                  onClick={() =>
                    openModal('ROUTE_MEDIA_DELETE', {
                      idRoute,
                      idMedia: item.id
                    })
                  }
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </RemoveButtonStyled>
              )}
            </ItemStyled>
          );
        })}
        {addCard}
      </StripStyled>
    </SectionStyled>
  );
};

const formatDuration = (seconds?: number | null) => {
  if (!seconds) return '';

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

const SectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

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

const CardStyled = styled('button')`
  display: block;
  width: ${TILE_WIDTH}px;
  padding: 0;
  text-align: left;
  color: inherit;
  cursor: pointer;
  background: none;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  overflow: hidden;
`;

const AddCardStyled = styled('button')`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
  width: ${TILE_WIDTH}px;
  min-height: calc(${TILE_WIDTH}px / (${TILE_RATIO}));
  padding: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.palette.text.secondary};
  cursor: pointer;
  background: none;
  border: 1px dashed ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;

  &:hover {
    color: ${({ theme }) => theme.palette.primary.main};
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: ${TILE_RATIO};
  color: ${({ theme }) => theme.palette.text.secondary};
  background: ${({ theme }) => theme.palette.action.hover};
`;

const PlayBadgeStyled = styled('span')`
  position: relative;
  display: flex;
  padding: ${({ theme }) => theme.spacing(0.5)};
  color: ${({ theme }) => theme.palette.common.white};
  background: ${({ theme }) => alpha(theme.palette.common.black, 0.5)};
  border-radius: 50%;
`;

const ImageStyled = styled('img')`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CaptionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(1, 1.5, 1.5)};
`;
