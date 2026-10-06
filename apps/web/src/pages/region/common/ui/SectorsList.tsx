import { useEffect, useRef } from 'react';

import { styled } from '@mui/material/styles';

import { ListSkeleton } from '@web/shared/ui';

import type { Sector } from '../entities';
import type { SectorMatchSummary } from '../lib';
import { SectorCard } from './SectorCard';

export interface Props {
  sectors: Sector[];
  pinColors?: Record<string, string>;
  tickedOf?: Record<string, number>;
  matchOf?: Record<string, SectorMatchSummary>;
  idSelectedSector?: string;
  idDirtySector?: string;
  isEditing?: boolean;
  isLoading?: boolean;
  onSelect: (sector: Sector) => void;
  onShowOnMap?: (sector: Sector) => void;
  onEdit?: (sector: Sector) => void;
}

export const SectorsList = ({
  sectors,
  pinColors,
  tickedOf,
  matchOf,
  idSelectedSector,
  idDirtySector,
  isEditing,
  isLoading,
  onSelect,
  onShowOnMap,
  onEdit
}: Props) => {
  const listRef = useRef<HTMLDivElement>(null);
  const idScrolledToRef = useRef<string>(undefined);

  // Once per selection: a filter reorders the list and must not drag it back.
  useEffect(() => {
    const index = sectors.findIndex(({ id }) => id === idSelectedSector);

    if (index < 0 || idScrolledToRef.current === idSelectedSector) return;

    idScrolledToRef.current = idSelectedSector;
    listRef.current?.children[index]?.scrollIntoView({ block: 'nearest' });
  }, [idSelectedSector, sectors]);

  if (isLoading) return <ListSkeleton count={6} />;

  return (
    <ListStyled ref={listRef}>
      {sectors.map((sector) => (
        <SectorCard
          key={sector.id}
          sector={sector}
          pinColor={pinColors?.[sector.id]}
          tickedCount={tickedOf && (tickedOf[sector.id] ?? 0)}
          match={matchOf?.[sector.id]}
          isSelected={sector.id === idSelectedSector}
          isMissingOnMap={isEditing && !pinColors?.[sector.id]}
          isUnsaved={sector.id === idDirtySector}
          onSelect={onSelect}
          onShowOnMap={onShowOnMap}
          onEdit={onEdit}
        />
      ))}
    </ListStyled>
  );
};

const ListStyled = styled('div')`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(1.5)};
`;
