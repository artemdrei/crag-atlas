import type { VideoRoute } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { RouteOption } from './RouteOption';

export interface Props {
  route: VideoRoute;
  isSuggested: boolean;
  onChange: () => void;
}

export const ChosenRoute = ({ route, isSuggested, onChange }: Props) => (
  <ChosenStyled>
    <RowStyled>
      <RouteOption route={route} />
      <Button size="small" onClick={onChange}>
        <Trans>Change</Trans>
      </Button>
    </RowStyled>
    {isSuggested && (
      <Typography variant="caption" color="text.secondary">
        <Trans>Filled in from the video title</Trans>
      </Typography>
    )}
  </ChosenStyled>
);

const ChosenStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1, 1.5)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;
