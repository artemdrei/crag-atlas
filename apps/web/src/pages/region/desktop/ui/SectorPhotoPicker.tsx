import { useRef } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useModal } from '@web/app/providers';
import { useApiGetTopos } from '@web/features/topo';

export interface Props {
  idSector: string;
}

// The cover is the first photo, so this swaps it rather than appending.
export const SectorPhotoPicker = ({ idSector }: Props) => {
  const { t } = useLingui();
  const { openModal } = useModal();
  const { topos } = useApiGetTopos(idSector);
  const inputRef = useRef<HTMLInputElement>(null);

  const cover = topos[0];

  const pick = (files: File[]) => {
    const [first] = files;

    if (!first) return;

    if (!cover) {
      openModal('UPLOAD_PHOTO', {
        target: { kind: 'topo', idSector },
        files
      });

      return;
    }

    openModal('UPLOAD_PHOTO', {
      target: { kind: 'topo', idSector },
      files: [first],
      replacing: {
        idTopo: cover.id,
        photoUrl: cover.photoUrl,
        ratio: cover.width && cover.height ? cover.width / cover.height : 0,
        hasLines: cover.lines.length > 0
      }
    });
  };

  return (
    <>
      <PickerStyled type="button" onClick={() => inputRef.current?.click()}>
        {cover ? (
          <img src={cover.photoUrl} alt={t`Sector cover`} />
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
        multiple={!cover}
        hidden
        aria-label={cover ? t`Replace the photo` : t`Add a photo`}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);

          // The same file twice in a row fires no change event.
          event.target.value = '';

          pick(files);
        }}
      />
    </>
  );
};

const PickerStyled = styled('button')`
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 3 / 2;
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
