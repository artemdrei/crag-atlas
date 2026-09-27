import { useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { countryName, useGradeRange } from '@web/shared/lib';
import { CatalogCard, GradeBadge } from '@web/shared/ui';

import type { Region } from '../entities';

export interface Props {
  region: Region;
  isSelected?: boolean;
  isUnsaved?: boolean;
  onSelect: (region: Region) => void;
}

export const RegionCard = ({
  region,
  isSelected,
  isUnsaved,
  onSelect
}: Props) => {
  const { i18n } = useLingui();
  const gradeRange = useGradeRange(region);
  const place = [
    region.country && countryName(region.country, i18n.locale),
    region.province
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <CatalogCard
      alt={region.name}
      photoUrl={region.photoUrl}
      isSelected={isSelected}
      isUnsaved={isUnsaved}
      onSelect={() => onSelect(region)}
    >
      <HeaderRowStyled>
        <Typography variant="subtitle1" noWrap>
          {region.name}
        </Typography>
      </HeaderRowStyled>
      <Typography variant="body2" color="text.secondary">
        {place}
      </Typography>
      <FooterRowStyled>
        <GradeBadge grade={gradeRange} />
        <Typography variant="caption" color="text.secondary">
          {region.rockType} · {region.routeCount} routes · {region.sectorCount}{' '}
          sectors
        </Typography>
      </FooterRowStyled>
    </CatalogCard>
  );
};

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;

const FooterRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;
