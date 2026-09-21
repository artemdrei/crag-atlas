import { type FormEvent, useEffect, useState } from 'react';

import type { Region } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import TextField from '@mui/material/TextField';

import { useApiUpdateRegion } from '../hooks';
import { EditActions } from './EditActions';
import { EditFormStyled } from './EditFormStyled';

export interface Props {
  region: Region;
  /** Omitted in the sidebar, where the form is a permanent panel. */
  onClose?: () => void;
  /** Lets the grid outside mark the card this form is holding edits for. */
  onDirtyChange?: (isDirty: boolean) => void;
}

export const RegionEditForm = ({ region, onClose, onDirtyChange }: Props) => {
  const { t } = useLingui();
  const [name, setName] = useState(region.name);
  const [province, setProvince] = useState(region.province);
  const [rockType, setRockType] = useState(region.rockType);

  const isDirty =
    name !== region.name ||
    province !== region.province ||
    rockType !== region.rockType;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const { isPending, updateRegion } = useApiUpdateRegion({
    idRegion: region.id,
    onSaved: onClose
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateRegion({ name: name.trim(), province, rockType });
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
        label={t`Province`}
        value={province}
        onChange={(event) => setProvince(event.target.value)}
      />
      <TextField
        fullWidth
        label={t`Rock type`}
        value={rockType}
        onChange={(event) => setRockType(event.target.value)}
      />
      <EditActions isPending={isPending} onCancel={onClose} />
    </EditFormStyled>
  );
};
