import { type FormEvent, useEffect, useState } from 'react';

import type { Sector } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';

import { toast } from '@web/shared/lib';
import { ChangedTextField } from '@web/shared/ui';

import { useApiUpdateSector } from '../hooks';
import { EditActions } from './EditActions';
import { EditFormStyled } from './EditFormStyled';

export interface Props {
  sector: Sector;
  /** Omitted inside the editor, where the form is a permanent panel. */
  onClose?: () => void;
  /** Lets the list outside mark the row this form is holding edits for. */
  onDirtyChange?: (isDirty: boolean) => void;
}

export const SectorEditForm = ({ sector, onClose, onDirtyChange }: Props) => {
  const { t } = useLingui();
  const [name, setName] = useState(sector.name);
  const [description, setDescription] = useState(sector.description);

  const isDirty = name !== sector.name || description !== sector.description;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const { isPending, updateSector } = useApiUpdateSector({
    idSector: sector.id,
    idRegion: sector.idRegion,
    onSaved: () => {
      toast.success(t`Sector saved`);
      onClose?.();
    }
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    updateSector({
      name: name.trim(),
      description: description.trim()
    });
  };

  return (
    <EditFormStyled onSubmit={handleSubmit}>
      <ChangedTextField
        fullWidth
        label={t`Name`}
        value={name}
        isChanged={name !== sector.name}
        onChange={(event) => setName(event.target.value)}
      />
      <ChangedTextField
        fullWidth
        multiline
        minRows={2}
        label={t`Description`}
        value={description}
        isChanged={description !== sector.description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <EditActions isPending={isPending} onCancel={onClose} />
    </EditFormStyled>
  );
};
