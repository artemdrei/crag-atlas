import type { PropsWithChildren, ReactNode } from 'react';

import CardActionArea from '@mui/material/CardActionArea';
import { styled } from '@mui/material/styles';

import { photoFrame } from '@web/shared/theme/photoFrame';
import { hoverRing } from '@web/shared/theme/surfaces';

import { PhotoPlaceholder } from './PhotoPlaceholder';
import { UnsavedBadge } from './UnsavedBadge';

export interface Props {
  alt: string;
  photoUrl?: string | null;
  isSelected?: boolean;
  isUnsaved?: boolean;
  actions?: ReactNode;
  className?: string;
  onSelect: () => void;
}

export const CatalogCard = ({
  alt,
  photoUrl,
  isSelected,
  isUnsaved,
  actions,
  className,
  children,
  onSelect
}: PropsWithChildren<Props>) => (
  <RootStyled className={className}>
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

// Emotion's component selectors need a babel plugin this app does not use.
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
  border: 2px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.palette.primary.main : theme.palette.divider};
  position: relative;
  padding: ${({ theme }) => theme.spacing(1.5)};

  &:hover {
    ${({ theme }) => hoverRing(theme.palette.primary.main)}
  }
`;

const ThumbnailStyled = styled('div')`
  flex-shrink: 0;
  width: 96px;
`;

const PhotoStyled = styled('img')`
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  object-position: center;
  ${({ theme }) => photoFrame(theme)}
`;

const BodyStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.25)};
  flex-grow: 1;
  min-width: 0;
`;
