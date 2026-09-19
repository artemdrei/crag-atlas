import { type FormEvent, useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

import {
  ASCENT_STYLES,
  type AscentStyle,
  AscentStyleLabel
} from '@web/shared/ui';

import type { CreateTick } from '../entities';

export interface Props {
  isPending: boolean;
  onSubmit: (payload: Omit<CreateTick, 'idRoute'>) => void;
  onCancel: () => void;
}

export const TickForm = ({ isPending, onSubmit, onCancel }: Props) => {
  const { t } = useLingui();
  const [ascentStyle, setAscentStyle] = useState<AscentStyle>('redpoint');
  const [climbedAt, setClimbedAt] = useState(todayIso);
  const [attempts, setAttempts] = useState('');
  const [note, setNote] = useState('');

  // climbed_at is NOT NULL with a default, so an empty field must drop the key
  // rather than send an empty string.
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    onSubmit({
      ascentStyle,
      ...(climbedAt ? { climbedAt } : {}),
      ...(attempts ? { attempts: Number(attempts) } : {}),
      ...(note.trim() ? { note: note.trim() } : {})
    });
  };

  return (
    <FormStyled onSubmit={handleSubmit}>
      <TextField
        fullWidth
        type="date"
        label={t`Date`}
        value={climbedAt}
        slotProps={{ inputLabel: { shrink: true } }}
        onChange={(event) => setClimbedAt(event.target.value)}
      />

      <TextField
        select
        fullWidth
        label={t`Style`}
        value={ascentStyle}
        onChange={(event) => setAscentStyle(event.target.value as AscentStyle)}
      >
        {ASCENT_STYLES.map((value) => (
          <MenuItem key={value} value={value}>
            <AscentStyleLabel ascentStyle={value} />
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        type="number"
        label={t`Attempts`}
        value={attempts}
        slotProps={{ htmlInput: { min: 1 } }}
        onChange={(event) => setAttempts(event.target.value)}
      />

      <TextField
        fullWidth
        multiline
        minRows={2}
        label={t`Note`}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />

      <ActionsStyled>
        <Button type="button" onClick={onCancel}>
          <Trans>Cancel</Trans>
        </Button>
        <Button type="submit" variant="contained" disabled={isPending}>
          {isPending ? <Trans>Saving…</Trans> : <Trans>Log ascent</Trans>}
        </Button>
      </ActionsStyled>
    </FormStyled>
  );
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const FormStyled = styled('form')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

const ActionsStyled = styled('div')`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;
