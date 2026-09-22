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

/**
 * The sector's cover is its first photo. Clicking it swaps that photo rather
 * than adding another, which would land at the end and leave the cover as is.
 */
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
          <img src={cover.photoUrl} alt={cover.label} />
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

          // The same file twice in a row fires no change event, so the input
          // is cleared before the dialog opens.
          event.target.value = '';

          pick(files);
        }}
      />
    </>
  );
};

// A square slot the whole photo fits inside: the panel keeps its height
// whatever the shot's proportions, and nothing gets cropped away.
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
