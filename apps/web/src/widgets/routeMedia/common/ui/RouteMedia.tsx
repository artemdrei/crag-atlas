import { Trans, useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { RouteMediaItem } from '../entities';

export interface Props {
  items: RouteMediaItem[];
}

export const RouteMedia = ({ items }: Props) => {
  const { t } = useLingui();

  return (
    <StripStyled>
      {items.map((item) => (
        <CardStyled key={item.id}>
          <ThumbnailStyled>
            {!!item.duration && <PlayArrowIcon fontSize="large" />}
          </ThumbnailStyled>
          <CaptionStyled>
            <Typography variant="subtitle2" noWrap>
              {item.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {[item.author, item.duration].filter(Boolean).join(' · ')}
            </Typography>
          </CaptionStyled>
        </CardStyled>
      ))}
      <AddTileStyled aria-label={t`Add media`} disabled>
        <AddIcon />
        <Typography variant="caption" color="text.secondary">
          <Trans>Add yours</Trans>
        </Typography>
      </AddTileStyled>
    </StripStyled>
  );
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

const CardStyled = styled('div')`
  flex: 0 0 auto;
  width: 240px;
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

const AddTileStyled = styled(ButtonBase)`
  flex: 0 0 auto;
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  color: ${({ theme }) => theme.palette.text.secondary};
  border: 1px dashed ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;
