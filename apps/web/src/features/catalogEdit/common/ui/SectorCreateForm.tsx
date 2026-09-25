import { type FormEvent, useState } from 'react';

import type { Sector } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import TextField from '@mui/material/TextField';

import { toast } from '@web/shared/lib';

import { useApiCreateSector } from '../hooks';
import { EditActions } from './EditActions';
import { EditFormStyled } from './EditFormStyled';

export interface Props {
  idRegion: string;
  onCreated?: (sector: Sector) => void;
  onClose?: () => void;
}

export const SectorCreateForm = ({ idRegion, onCreated, onClose }: Props) => {
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
      <EditActions
        submitLabel={<Trans>Add sector</Trans>}
        isPending={isPending}
        isDisabled={!name.trim()}
        onCancel={onClose}
      />
    </EditFormStyled>
  );
};
