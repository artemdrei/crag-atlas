import { Trans } from '@lingui/react/macro';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  /** Square thumbnails sit in cards; the wide one stands in for a topo. */
  variant?: 'thumbnail' | 'wide';
}

/** Stands in wherever a photo belongs but none has been added yet. */
export const PhotoPlaceholder = ({ variant = 'thumbnail' }: Props) => (
  <PlaceholderStyled isWide={variant === 'wide'}>
    <PhotoCameraOutlinedIcon fontSize="small" color="disabled" />
    {variant === 'wide' && (
      <Typography variant="caption" color="text.secondary">
        <Trans>No topo yet</Trans>
      </Typography>
    )}
  </PlaceholderStyled>
);

const PlaceholderStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isWide'
})<{ isWide: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  aspect-ratio: ${({ isWide }) => (isWide ? '3 / 2' : '1 / 1')};
  border: 1px dashed ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: ${({ theme }) => theme.palette.action.hover};
`;
