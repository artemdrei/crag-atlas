import { useEffect, useRef } from 'react';

import { styled } from '@mui/material/styles';

import { ListSkeleton } from '@web/shared/ui';

import type { Sector } from '../entities';
import { SectorCard } from './SectorCard';

export interface Props {
  sectors: Sector[];
  pinColors?: Record<string, string>;
  tickedOf?: Record<string, number>;
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
  idSelectedSector,
  idDirtySector,
  isEditing,
  isLoading,
  onSelect,
  onShowOnMap,
  onEdit
}: Props) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const index = sectors.findIndex(({ id }) => id === idSelectedSector);

    if (index < 0) return;

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
