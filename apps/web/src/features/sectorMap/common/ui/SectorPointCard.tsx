import type { Sector } from '@crag-atlas/api';
import { Plural, Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { sectorPoint } from '../lib';
import { SectorDirectionsButton } from './SectorDirectionsButton';

export interface Props {
  sector: Sector;
  onOpen: () => void;
}

export const SectorPointCard = ({ sector, onOpen }: Props) => (
  <CardStyled>
    <Typography variant="subtitle1">{sector.name}</Typography>
    <Typography variant="caption" color="text.secondary">
      <Plural
        value={sector.routeCount}
        one="# route"
        few="# routes"
        many="# routes"
        other="# routes"
      />
    </Typography>
    <ActionsStyled>
      <Button variant="contained" size="small" onClick={onOpen}>
        <Trans>Open sector</Trans>
      </Button>
      <SectorDirectionsButton point={sectorPoint(sector)} />
    </ActionsStyled>
  </CardStyled>
);

const CardStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background-color: ${({ theme }) => theme.palette.background.paper};
`;

const ActionsStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;
