import type { ReactNode } from 'react';

import type { Sector } from '@crag-atlas/api';
import { styled } from '@mui/material/styles';

import type { Coords, MappedSector } from '../common';
import { SectorMapCanvas, SectorPointCard } from '../common';

export interface Props {
  mapped: MappedSector[];
  selectedSector?: Sector;
  aside?: ReactNode;
  mainFooter?: ReactNode;
  isEditing?: boolean;
  onOpenSector: (idSector: string) => void;
  onSelectSector: (idSector: string) => void;
  onPlacePoint: (point: Coords) => void;
}

export const SectorMapDesktop = ({
  mapped,
  selectedSector,
  aside,
  mainFooter,
  isEditing,
  onOpenSector,
  onSelectSector,
  onPlacePoint
}: Props) => (
  <LayoutStyled hasAside={!!aside}>
    <MainStyled>
      <MapAreaStyled>
        <SectorMapCanvas
          points={mapped}
          idSelectedSector={selectedSector?.id}
          isEditing={isEditing && !!selectedSector}
          onSelect={onSelectSector}
          onPlace={onPlacePoint}
        />
        {selectedSector && !isEditing && (
          <OverlayStyled>
            <SectorPointCard
              sector={selectedSector}
              onOpen={() => onOpenSector(selectedSector.id)}
            />
          </OverlayStyled>
        )}
      </MapAreaStyled>
      <FooterStyled>{mainFooter}</FooterStyled>
    </MainStyled>

    {aside && <SideStyled>{aside}</SideStyled>}
  </LayoutStyled>
);

const LayoutStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'hasAside'
})<{ hasAside: boolean }>`
  display: grid;
  grid-template-columns: ${({ hasAside }) =>
    hasAside ? 'minmax(0, 1fr) 360px' : 'minmax(0, 1fr)'};
  gap: ${({ theme }) => theme.spacing(3)};
  height: 100%;
  min-height: 0;
`;

const MainStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 0;
  overflow: hidden;
`;

const FooterStyled = styled('div')`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
`;

const MapAreaStyled = styled('div')`
  position: relative;
  flex: 0 1 460px;
  min-height: 220px;
`;

const OverlayStyled = styled('div')`
  position: absolute;
  left: ${({ theme }) => theme.spacing(2)};
  bottom: ${({ theme }) => theme.spacing(2)};
  width: 280px;
`;

const SideStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 0;
  overflow-y: auto;
`;
