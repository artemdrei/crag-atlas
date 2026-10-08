import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  CatalogCard,
  CatalogCardMenu,
  GradeHistogram,
  LocalName,
  ShelterBadge,
  TickProgress
} from '@web/shared/ui';

import type { Sector } from '../entities';
import type { SectorMatchSummary } from '../lib';

export interface Props {
  sector: Sector;
  pinColor?: string;
  tickedCount?: number;
  match?: SectorMatchSummary;
  isSelected?: boolean;
  isMissingOnMap?: boolean;
  isUnsaved?: boolean;
  onSelect: (sector: Sector) => void;
  onShowOnMap?: (sector: Sector) => void;
  onEdit?: (sector: Sector) => void;
}

export const SectorCard = ({
  sector,
  pinColor,
  tickedCount,
  match,
  isSelected,
  isMissingOnMap,
  isUnsaved,
  onSelect,
  onShowOnMap,
  onEdit
}: Props) => {
  const { t } = useLingui();
  const isUnmatched = match?.matchedCount === 0;
  const gradeHistogram = match?.gradeHistogram ?? sector.gradeHistogram;

  return (
    <CardStyled
      isMuted={isUnmatched}
      alt={sector.name}
      photoUrl={sector.photoUrl}
      isSelected={isSelected}
      isUnsaved={isUnsaved}
      thumbnailBadge={
        sector.shelter !== 'open' && <ShelterBadge shelter={sector.shelter} />
      }
      actions={
        onShowOnMap && (
          <CatalogCardMenu
            label={t`Actions for ${sector.name}`}
            onShowOnMap={() => onShowOnMap(sector)}
            onEdit={onEdit && (() => onEdit(sector))}
          />
        )
      }
      onSelect={() => onSelect(sector)}
    >
      <HeaderRowStyled>
        <TitleStyled>
          {pinColor && <DotStyled color={pinColor} />}
          <NameStyled variant="subtitle1" noWrap>
            {sector.name}
            <LocalName name={sector.name} nameLocal={sector.nameLocal} />
          </NameStyled>
        </TitleStyled>
        {isMissingOnMap && (
          <Typography variant="caption" color="text.secondary" noWrap>
            <Trans>not on the map</Trans>
          </Typography>
        )}
      </HeaderRowStyled>
      <Typography variant="body2" color="text.secondary">
        {sector.description}
      </Typography>
      <FooterStyled>
        <CountRowStyled>
          <Typography variant="caption" color="text.secondary" noWrap>
            {isUnmatched ? (
              <Trans>no matches</Trans>
            ) : match ? (
              <Trans>
                {match.matchedCount} of {sector.routeCount} match
              </Trans>
            ) : (
              <Plural
                value={sector.routeCount}
                one="# route"
                few="# routes"
                many="# routes"
                other="# routes"
              />
            )}
          </Typography>
          {tickedCount !== undefined && (
            <ProgressStyled
              tickedCount={tickedCount}
              routesCount={sector.routeCount}
            />
          )}
        </CountRowStyled>
        {gradeHistogram.map((group) => (
          <GradeHistogram key={group.type} group={group} isCompact />
        ))}
      </FooterStyled>
    </CardStyled>
  );
};

const CardStyled = styled(CatalogCard, {
  shouldForwardProp: (prop) => prop !== 'isMuted'
})<{ isMuted: boolean }>`
  opacity: ${({ isMuted }) => (isMuted ? 0.5 : 1)};
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const NameStyled = styled(Typography)`
  min-width: 0;
`;

const TitleStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;

const DotStyled = styled('span', {
  shouldForwardProp: (prop) => prop !== 'color'
})<{ color: string }>`
  width: 10px;
  height: 10px;
  flex: none;
  border-radius: 50%;
  background-color: ${({ color }) => color};
`;

const CountRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const ProgressStyled = styled(TickProgress)`
  flex: none;
  width: 70px;
`;

const FooterStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.25)};
  padding-top: ${({ theme }) => theme.spacing(0.25)};
`;
