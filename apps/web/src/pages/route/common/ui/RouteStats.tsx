import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

/** Demo values until the API counts ascents. */
const DEMO_ASCENTS = 340;
const DEMO_ONSIGHT_SHARE = 18;

export const RouteStats = () => (
  <RowStyled>
    <TileStyled>
      <ValueStyled variant="h5">{DEMO_ASCENTS}</ValueStyled>
      <Typography variant="caption" color="text.secondary">
        <Trans>ascents</Trans>
      </Typography>
    </TileStyled>
    <TileStyled>
      <ValueStyled variant="h5">{DEMO_ONSIGHT_SHARE}%</ValueStyled>
      <Typography variant="caption" color="text.secondary">
        <Trans>onsight</Trans>
      </Typography>
    </TileStyled>
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
