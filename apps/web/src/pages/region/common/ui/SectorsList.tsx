import { useEffect, useRef } from 'react';

import { styled } from '@mui/material/styles';

import type { Sector } from '../entities';
import { SectorCard } from './SectorCard';

export interface Props {
  sectors: Sector[];
  pinColors?: Record<string, string>;
  idSelectedSector?: string;
  /** The card whose form holds edits nobody saved yet. */
  idDirtySector?: string;
  isEditing?: boolean;
  onSelect: (sector: Sector) => void;
  onShowOnMap?: (sector: Sector) => void;
  onEdit?: (sector: Sector) => void;
}

export const SectorsList = ({
  sectors,
  pinColors,
  idSelectedSector,
  idDirtySector,
  isEditing,
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

  return (
    <ListStyled ref={listRef}>
      {sectors.map((sector) => (
        <SectorCard
          key={sector.id}
          sector={sector}
          pinColor={pinColors?.[sector.id]}
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
