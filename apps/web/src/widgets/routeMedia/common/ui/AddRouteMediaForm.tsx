import { type ChangeEvent, type FormEvent, useRef, useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

import { parseMediaLink } from '@web/shared/lib';
import { FormActions } from '@web/shared/ui';

import type { RouteMediaDraft } from '../entities';

export interface Props {
  isPending: boolean;
  onSubmit: (draft: RouteMediaDraft) => void;
  onCancel: () => void;
}

export const AddRouteMediaForm = ({ isPending, onSubmit, onCancel }: Props) => {
  const { t } = useLingui();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const link = parseMediaLink(url);
  const canSubmit = !!link || !!file;

  const pickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0] ?? null;

    event.target.value = '';

    if (picked) setFile(picked);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (link) onSubmit({ kind: 'video', url: link.url });
    else if (file) onSubmit({ kind: 'photo', file });
  };

  return (
    <FormStyled onSubmit={handleSubmit}>
      <TextField
        fullWidth
        size="small"
        value={url}
        disabled={!!file}
        error={!!url && !link}
        label={t`YouTube or Instagram link`}
        helperText={
          url && !link ? <Trans>Only YouTube and Instagram links.</Trans> : ' '
        }
        onChange={(event) => setUrl(event.target.value)}
      />

      {file ? (
        <ChipStyled
          label={file.name}
          onDelete={() => setFile(null)}
          disabled={isPending}
        />
      ) : (
        <Button
          type="button"
          variant="outlined"
          disabled={!!url}
          startIcon={<AddPhotoAlternateOutlinedIcon fontSize="small" />}
          onClick={() => inputRef.current?.click()}
        >
          <Trans>Add photo</Trans>
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        aria-label={t`Add photo`}
        onChange={pickFile}
      />

      <FormActions>
        <Button type="button" onClick={onCancel}>
          <Trans>Cancel</Trans>
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isPending || !canSubmit}
        >
          {isPending ? <Trans>Saving…</Trans> : <Trans>Add</Trans>}
        </Button>
      </FormActions>
    </FormStyled>
  );
};

const FormStyled = styled('form')`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding-top: ${({ theme }) => theme.spacing(1)};

  & > *:last-child {
    align-self: stretch;
  }
`;

const ChipStyled = styled(Chip)`
  max-width: 100%;

  & .MuiChip-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
