import { type FormEvent, useState } from 'react';

import type { Sector } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { toast } from '@web/shared/lib';

import { useApiCreateSector } from '../hooks';
import { EditFormStyled } from './EditFormStyled';

export interface Props {
  idRegion: string;
  onCreated?: (sector: Sector) => void;
}

export const SectorCreateForm = ({ idRegion, onCreated }: Props) => {
  const { t } = useLingui();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { isPending, createSector } = useApiCreateSector({
    idRegion,
    onCreated: (sector) => {
      setName('');
      setDescription('');
      toast.success(t`Sector ${sector.name} created`);
      onCreated?.(sector);
    }
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    createSector({
      name: name.trim(),
      description: description.trim()
    });
  };

  return (
    <EditFormStyled onSubmit={handleSubmit}>
      <TextField
        fullWidth
        size="small"
        label={t`Name`}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <TextField
        fullWidth
        multiline
        size="small"
        minRows={2}
        label={t`Description`}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={!name.trim() || isPending}
      >
        <Trans>Add sector</Trans>
      </Button>
    </EditFormStyled>
  );
};
