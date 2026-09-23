import { type ChangeEvent, useRef, useState } from 'react';

import type { TickMedia } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

import type { PendingMedia } from '../entities';
import { parseMediaLink } from '../lib';

export interface Props {
  media?: TickMedia[];
  pending: PendingMedia;
  onChange: (pending: PendingMedia) => void;
}

export const TickMediaField = ({ media = [], pending, onChange }: Props) => {
  const { t } = useLingui();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);

  const addLink = () => {
    const url = parseMediaLink(draft);

    if (!url) {
      setIsInvalid(true);

      return;
    }

    setDraft('');
    setIsInvalid(false);
    onChange({ ...pending, links: [...pending.links, url] });
  };

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    event.target.value = '';

    if (files.length)
      onChange({ ...pending, files: [...pending.files, ...files] });
  };

  return (
    <FieldStyled>
      <LinkRowStyled>
        <TextField
          fullWidth
          size="small"
          value={draft}
          error={isInvalid}
          label={t`YouTube or Instagram link`}
          helperText={
            isInvalid ? (
              <Trans>Only YouTube and Instagram links.</Trans>
            ) : undefined
          }
          onChange={(event) => {
            setDraft(event.target.value);
            setIsInvalid(false);
          }}
        />
        <Button
          type="button"
          disabled={!parseMediaLink(draft)}
          onClick={addLink}
        >
          <Trans>Add</Trans>
        </Button>
      </LinkRowStyled>

      <Button
        type="button"
        variant="outlined"
        startIcon={<AddPhotoAlternateOutlinedIcon fontSize="small" />}
        onClick={() => inputRef.current?.click()}
      >
        <Trans>Add photo</Trans>
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        aria-label={t`Add photo`}
        onChange={addFiles}
      />

      <ChipsStyled>
        {media.map((item) => (
          <Chip key={item.id} size="small" label={item.url} />
        ))}
        {pending.links.map((url) => (
          <Chip
            key={url}
            size="small"
            label={url}
            onDelete={() =>
              onChange({
                ...pending,
                links: pending.links.filter((link) => link !== url)
              })
            }
          />
        ))}
        {pending.files.map((file) => (
          <Chip
            key={file.name}
            size="small"
            label={file.name}
            onDelete={() =>
              onChange({
                ...pending,
                files: pending.files.filter((item) => item !== file)
              })
            }
          />
        ))}
      </ChipsStyled>
    </FieldStyled>
  );
};

const FieldStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const LinkRowStyled = styled('div')`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const ChipsStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};

  & .MuiChip-label {
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
