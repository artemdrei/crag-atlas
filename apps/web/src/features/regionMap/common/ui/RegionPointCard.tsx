import type { Region } from '@crag-atlas/api';
import { Plural, Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { coordsOf, countryName } from '@web/shared/lib';
import { DirectionsButton, GradeHistogram } from '@web/shared/ui';

const MAX_COLUMNS = 10;

export interface Props {
  region: Region;
  onOpen: () => void;
}

export const RegionPointCard = ({ region, onOpen }: Props) => {
  const place = region.country ? countryName(region.country) : '';

  return (
    <CardStyled>
      <Typography variant="subtitle1" noWrap>
        {region.name}
      </Typography>
      {place && (
        <Typography variant="body2" color="text.secondary">
          {place}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary">
        <Plural
          value={region.routeCount}
          one="# route"
          few="# routes"
          many="# routes"
          other="# routes"
        />
      </Typography>
      {region.gradeHistogram.map((group) => (
        <HistogramStyled
          key={group.type}
          group={group}
          isCompact
          maxColumns={MAX_COLUMNS}
        />
      ))}
      <ActionsStyled>
        <Button variant="contained" size="small" onClick={onOpen}>
          <Trans>Open region</Trans>
        </Button>
        <DirectionsButton point={coordsOf(region)} />
      </ActionsStyled>
    </CardStyled>
  );
};

const ActionsStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const HistogramStyled = styled(GradeHistogram)`
  align-self: stretch;
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const CardStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(2)};
  /* A length, not a percentage: this card's max-content sizes its own
     absolutely-positioned parent. */
  width: max-content;
  min-width: ${({ theme }) => theme.spacing(44)};
  max-width: ${({ theme }) => theme.spacing(68)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background-color: ${({ theme }) => theme.palette.background.paper};
`;
