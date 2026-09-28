import { Plural, useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { countryName, useGradeRange } from '@web/shared/lib';
import { CatalogCard, CatalogCardMenu, GradeBadge } from '@web/shared/ui';

import type { Region } from '../entities';

export interface Props {
  region: Region;
  isSelected?: boolean;
  isUnsaved?: boolean;
  onSelect: (region: Region) => void;
  onShowOnMap?: (region: Region) => void;
  onEdit?: (region: Region) => void;
}

export const RegionCard = ({
  region,
  isSelected,
  isUnsaved,
  onSelect,
  onShowOnMap,
  onEdit
}: Props) => {
  const { t } = useLingui();
  const gradeRange = useGradeRange(region);
  const place = region.country ? countryName(region.country) : '';

  return (
    <CatalogCard
      alt={region.name}
      photoUrl={region.photoUrl}
      isSelected={isSelected}
      isUnsaved={isUnsaved}
      actions={
        onShowOnMap && (
          <CatalogCardMenu
            label={t`Actions for ${region.name}`}
            onShowOnMap={() => onShowOnMap(region)}
            onEdit={onEdit && (() => onEdit(region))}
          />
        )
      }
      onSelect={() => onSelect(region)}
    >
      <TitleStyled>
        <Typography variant="subtitle1" noWrap>
          {region.name}
        </Typography>
        {place && (
          <Typography variant="body2" color="text.secondary">
            {place}
          </Typography>
        )}
      </TitleStyled>
      <CountsStyled variant="caption" color="text.secondary" noWrap>
        <Plural
          value={region.routeCount}
          one="# route"
          few="# routes"
          many="# routes"
          other="# routes"
        />
        {' · '}
        <Plural
          value={region.sectorCount}
          one="# sector"
          few="# sectors"
          many="# sectors"
          other="# sectors"
        />
        {region.rockType && ` · ${region.rockType}`}
      </CountsStyled>
      <BadgeRowStyled>
        <GradeBadge grade={gradeRange} />
      </BadgeRowStyled>
    </CatalogCard>
  );
};

const TitleStyled = styled('div')`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const CountsStyled = styled(Typography)`
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

// A chip in a flex column would stretch to the card's width.
const BadgeRowStyled = styled('div')`
  display: flex;
`;
