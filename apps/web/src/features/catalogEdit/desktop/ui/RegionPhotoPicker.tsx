import { useRef } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useModal } from '@web/app/providers';

export interface Props {
  idRegion: string;
  photoUrl?: string | null;
}

// A region has one photo, not a gallery, so clicking the cover swaps it.
export const RegionPhotoPicker = ({ idRegion, photoUrl }: Props) => {
  const { t } = useLingui();
  const { openModal } = useModal();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <PickerStyled type="button" onClick={() => inputRef.current?.click()}>
        {photoUrl ? (
          <img src={photoUrl} alt="" />
        ) : (
          <PlaceholderStyled>
            <AddPhotoAlternateOutlinedIcon fontSize="small" />
            <Typography variant="caption" color="text.secondary">
              <Trans>Add a photo</Trans>
            </Typography>
          </PlaceholderStyled>
        )}
      </PickerStyled>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        aria-label={photoUrl ? t`Replace the photo` : t`Add a photo`}
        onChange={(event) => {
          const file = event.target.files?.[0];

          // The same file twice in a row fires no change event.
          event.target.value = '';

          if (file) {
            openModal('UPLOAD_PHOTO', {
              target: { kind: 'region', idRegion, photoUrl },
              file
            });
          }
        }}
      />
    </>
  );
};

// A square slot the whole photo fits inside, so nothing is cropped away.
const PickerStyled = styled('button')`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1 / 1;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: ${({ theme }) => theme.palette.action.hover};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;

  & img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const PlaceholderStyled = styled('span')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  color: ${({ theme }) => theme.palette.text.secondary};
`;
