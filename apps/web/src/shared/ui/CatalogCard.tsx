import type { PropsWithChildren } from 'react';

import CardActionArea from '@mui/material/CardActionArea';
import { styled } from '@mui/material/styles';

import { photoFrame } from '@web/shared/theme/photoFrame';

import { PhotoPlaceholder } from './PhotoPlaceholder';
import { UnsavedBadge } from './UnsavedBadge';

export interface Props {
  alt: string;
  photoUrl?: string | null;
  isSelected?: boolean;
  isUnsaved?: boolean;
  onSelect: () => void;
}

/** A small square thumbnail beside the text, so the card keeps its height
    whatever the grid's column count. Regions and sectors read the same. */
export const CatalogCard = ({
  alt,
  photoUrl,
  isSelected,
  isUnsaved,
  children,
  onSelect
}: PropsWithChildren<Props>) => (
  <CardAreaStyled isSelected={!!isSelected} onClick={onSelect}>
    {isUnsaved && <UnsavedBadge />}
    <ThumbnailStyled>
      {photoUrl ? (
        <PhotoStyled src={photoUrl} alt={alt} />
      ) : (
        <PhotoPlaceholder />
      )}
    </ThumbnailStyled>
    <BodyStyled>{children}</BodyStyled>
  </CardAreaStyled>
);

const CardAreaStyled = styled(CardActionArea, {
  shouldForwardProp: (prop) => prop !== 'isSelected'
})<{ isSelected: boolean }>`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.palette.primary.main : theme.palette.divider};
  position: relative;
  padding: ${({ theme }) => theme.spacing(1.5)};
`;

const ThumbnailStyled = styled('div')`
  flex-shrink: 0;
  width: 96px;
`;

// Contained, not cropped: a crag photo loses its point when its edges are cut.
const PhotoStyled = styled('img')`
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  ${({ theme }) => photoFrame(theme)}
`;

const BodyStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  flex-grow: 1;
  min-width: 0;
`;
