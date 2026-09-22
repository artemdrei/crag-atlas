import { Plural } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { CatalogCard } from '@web/shared/ui';
import { GradeHistogram } from '@web/widgets/gradeHistogram';

import type { Sector } from '../entities';

export interface Props {
  sector: Sector;
  isSelected?: boolean;
  isUnsaved?: boolean;
  onSelect: (sector: Sector) => void;
}

export const SectorCard = ({
  sector,
  isSelected,
  isUnsaved,
  onSelect
}: Props) => {
  return (
    <CatalogCard
      alt={sector.name}
      photoUrl={sector.photoUrl}
      isSelected={isSelected}
      isUnsaved={isUnsaved}
      onSelect={() => onSelect(sector)}
    >
      <HeaderRowStyled>
        <Typography variant="subtitle1" noWrap>
          {sector.name}
        </Typography>
      </HeaderRowStyled>
      <Typography variant="body2" color="text.secondary">
        {sector.description}
      </Typography>
      <FooterStyled>
        <Typography variant="caption" color="text.secondary">
          <Plural
            value={sector.routeCount}
            one="# route"
            few="# routes"
            many="# routes"
            other="# routes"
          />
        </Typography>
        {sector.gradeHistogram.map((group) => (
          <GradeHistogram key={group.type} group={group} isCompact />
        ))}
      </FooterStyled>
    </CatalogCard>
  );
};

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const FooterStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;
