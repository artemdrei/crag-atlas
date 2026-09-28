import type { PropsWithChildren, ReactNode } from 'react';

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
  actions?: ReactNode;
  onSelect: () => void;
}

/** A small square thumbnail beside the text, so the card keeps its height
    whatever the grid's column count. Regions and sectors read the same. */
export const CatalogCard = ({
  alt,
  photoUrl,
  isSelected,
  isUnsaved,
  actions,
  children,
  onSelect
}: PropsWithChildren<Props>) => (
  <RootStyled>
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
    {/* A sibling, never a child: the card is itself one big button. */}
    {actions && <ActionsStyled data-card-actions>{actions}</ActionsStyled>}
  </RootStyled>
);

// Emotion's component selectors need a babel plugin this app does not use, so
// the reveal hangs off an attribute rather than off ActionsStyled itself.
const RootStyled = styled('div')`
  position: relative;

  &:hover [data-card-actions],
  &:focus-within [data-card-actions],
  & [data-card-actions]:has([aria-expanded='true']) {
    opacity: 1;
  }
`;

const ActionsStyled = styled('div')`
  position: absolute;
  top: ${({ theme }) => theme.spacing(0.5)};
  right: ${({ theme }) => theme.spacing(0.5)};
  opacity: 0;
  transition: ${({ theme }) => theme.transitions.create('opacity')};
`;

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
