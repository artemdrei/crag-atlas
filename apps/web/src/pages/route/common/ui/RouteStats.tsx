import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  ascentsCount: number;
  onsightCount?: number | null;
}

export const RouteStats = ({ ascentsCount, onsightCount }: Props) => (
  <RowStyled>
    <TileStyled>
      <ValueStyled variant="h5">{ascentsCount}</ValueStyled>
      <Typography variant="caption" color="text.secondary">
        <Trans>ascents</Trans>
      </Typography>
    </TileStyled>
    {!!onsightCount && (
      <TileStyled>
        <ValueStyled variant="h5">
          {Math.round((onsightCount / ascentsCount) * 100)}%
        </ValueStyled>
        <Typography variant="caption" color="text.secondary">
          <Trans>onsight</Trans>
        </Typography>
      </TileStyled>
    )}
  </RowStyled>
);

const RowStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const TileStyled = styled('div')`
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const ValueStyled = styled(Typography)`
  font-family: ${({ theme }) => theme.typography.h4.fontFamily};
`;
