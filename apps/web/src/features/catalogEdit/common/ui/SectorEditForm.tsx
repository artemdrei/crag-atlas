import { type FormEvent, useState } from 'react';

import type { Sector } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import TextField from '@mui/material/TextField';

import { useApiUpdateSector } from '../hooks';
import { EditActions } from './EditActions';
import { EditFormStyled } from './EditFormStyled';

export interface Props {
  sector: Sector;
  onClose: () => void;
}

export const SectorEditForm = ({ sector, onClose }: Props) => {
  const { t } = useLingui();
  const [name, setName] = useState(sector.name);
  const [description, setDescription] = useState(sector.description);
  const [approachMinutes, setApproachMinutes] = useState(
    sector.approachMinutes ? String(sector.approachMinutes) : ''
  );

  const { isPending, updateSector } = useApiUpdateSector({
    idSector: sector.id,
    idRegion: sector.idRegion,
    onSaved: onClose
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    updateSector({
      name: name.trim(),
      description: description.trim(),
      // An empty field means "unknown", not zero minutes.
      approachMinutes: approachMinutes ? Number(approachMinutes) : null
    });
  };

  return (
    <EditFormStyled onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label={t`Name`}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <TextField
        fullWidth
        multiline
        minRows={2}
        label={t`Description`}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <TextField
        fullWidth
        type="number"
        label={t`Approach, minutes`}
        value={approachMinutes}
        slotProps={{ htmlInput: { min: 0 } }}
        onChange={(event) => setApproachMinutes(event.target.value)}
      />
      <EditActions isPending={isPending} onCancel={onClose} />
    </EditFormStyled>
  );
};
