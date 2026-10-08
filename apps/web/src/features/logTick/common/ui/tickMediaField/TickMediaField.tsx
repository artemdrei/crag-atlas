import { type ChangeEvent, useId, useRef, useState } from 'react';

import type { TickMedia } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { parseMediaLink } from '@web/shared/lib';

import type { PendingMedia } from '../../entities';
import { FileThumb, MediaThumb, THUMB_SIZE } from './MediaThumb';

export interface Props {
  media?: TickMedia[];
  pending: PendingMedia;
  onChange: (pending: PendingMedia) => void;
}

export const TickMediaField = ({ media = [], pending, onChange }: Props) => {
  const { t } = useLingui();
  const idLink = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);

  const savedVideos = media.filter((item) => item.kind === 'video');
  const savedPhotos = media.filter((item) => item.kind === 'photo');

  const addLink = (value: string): boolean => {
    const link = parseMediaLink(value);

    if (!link) return false;

    setDraft('');
    setIsInvalid(false);

    if (!pending.links.includes(link.url)) {
      onChange({ ...pending, links: [...pending.links, link.url] });
    }

    return true;
  };

  // Typed links are committed on blur, Enter or the add button, never per
  // keystroke: a half-typed id already parses once it is five characters long.
  const commitDraft = () => {
    if (draft.trim() && !addLink(draft)) setIsInvalid(true);
  };

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    event.target.value = '';

    if (files.length)
      onChange({ ...pending, files: [...pending.files, ...files] });
  };

  return (
    <FieldStyled>
      <GroupStyled>
        <Typography component="label" variant="subtitle2" htmlFor={idLink}>
          <Trans>YouTube or Instagram link</Trans>
        </Typography>
        <TextField
          fullWidth
          size="small"
          id={idLink}
          value={draft}
          error={isInvalid}
          placeholder="https://"
          helperText={
            isInvalid ? (
              <Trans>Only YouTube and Instagram links.</Trans>
            ) : undefined
          }
          slotProps={{
            input: {
              endAdornment: draft ? (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    size="small"
                    aria-label={t`Add the link`}
                    onClick={commitDraft}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined
            }
          }}
          onChange={(event) => {
            setDraft(event.target.value);
            setIsInvalid(false);
          }}
          onPaste={(event) => {
            if (addLink(event.clipboardData.getData('text'))) {
              event.preventDefault();
            }
          }}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;

            event.preventDefault();
            commitDraft();
          }}
        />
        {(savedVideos.length > 0 || pending.links.length > 0) && (
          <GridStyled>
            {savedVideos.map((item) => (
              <MediaThumb key={item.id} label={item.url} videoUrl={item.url} />
            ))}
            {pending.links.map((url) => (
              <MediaThumb
                key={url}
                label={url}
                videoUrl={url}
                onRemove={() =>
                  onChange({
                    ...pending,
                    links: pending.links.filter((link) => link !== url)
                  })
                }
              />
            ))}
          </GridStyled>
        )}
      </GroupStyled>

      <GroupStyled>
        <div>
          <Typography variant="subtitle2">
            <Trans>Photos</Trans>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <Trans>Add as many as you like — everyone will see them.</Trans>
          </Typography>
        </div>
        <GridStyled>
          {savedPhotos.map((item) => (
            <MediaThumb key={item.id} label={item.url} photoUrl={item.url} />
          ))}
          {pending.files.map((file) => (
            <FileThumb
              key={`${file.name}-${file.lastModified}`}
              file={file}
              onRemove={() =>
                onChange({
                  ...pending,
                  files: pending.files.filter((item) => item !== file)
                })
              }
            />
          ))}
          <AddTileStyled
            type="button"
            aria-label={t`Add photo`}
            onClick={() => inputRef.current?.click()}
          >
            <AddPhotoAlternateOutlinedIcon />
          </AddTileStyled>
        </GridStyled>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          aria-label={t`Add photo`}
          onChange={addFiles}
        />
      </GroupStyled>
    </FieldStyled>
  );
};

const FieldStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
  width: 100%;
`;

const GroupStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const GridStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const AddTileStyled = styled(ButtonBase)`
  width: ${THUMB_SIZE}px;
  height: ${THUMB_SIZE}px;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px dashed ${({ theme }) => theme.palette.divider};
  color: ${({ theme }) => theme.palette.text.secondary};

  &:hover {
    border-color: ${({ theme }) => theme.palette.primary.main};
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;
