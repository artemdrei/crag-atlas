import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  ascentsCount: number;
  onsightCount?: number | null;
  isCompact?: boolean;
  className?: string;
}

export const RouteStats = ({
  ascentsCount,
  onsightCount,
  isCompact,
  className
}: Props) => (
  <RowStyled className={className}>
    <TileStyled isCompact={!!isCompact}>
      <Typography variant="caption" color="text.secondary">
        <Trans>ascents</Trans>
      </Typography>
      <ValueStyled variant="h5">{ascentsCount}</ValueStyled>
    </TileStyled>
    {!!onsightCount && (
      <TileStyled isCompact={!!isCompact}>
        <Typography variant="caption" color="text.secondary">
          <Trans>onsight</Trans>
        </Typography>
        <ValueStyled variant="h5">
          {Math.round((onsightCount / ascentsCount) * 100)}%
        </ValueStyled>
      </TileStyled>
    )}
  </RowStyled>
);

const RowStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const TileStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isCompact'
})<{ isCompact: boolean }>`
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme, isCompact }) => theme.spacing(isCompact ? 1.5 : 2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const ValueStyled = styled(Typography)`
  font-family: ${({ theme }) => theme.typography.h4.fontFamily};
`;
