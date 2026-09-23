import { type FormEvent, type ReactNode, useEffect, useState } from 'react';

import type { Sector } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';

import { toast } from '@web/shared/lib';
import { ChangedTextField } from '@web/shared/ui';

import { useApiUpdateSector } from '../hooks';
import { EditActions } from './EditActions';
import { EditFormStyled } from './EditFormStyled';

export interface Props {
  sector: Sector;
  point?: { lat: number; lng: number };
  children?: ReactNode;
  onClose?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  leftAction?: ReactNode;
}

export const SectorEditForm = ({
  sector,
  point,
  children,
  onClose,
  onDirtyChange,
  leftAction
}: Props) => {
  const { t } = useLingui();
  const [name, setName] = useState(sector.name);
  const [description, setDescription] = useState(sector.description);

  const isDirty =
    name !== sector.name ||
    description !== sector.description ||
    (point?.lat ?? null) !== (sector.lat ?? null) ||
    (point?.lng ?? null) !== (sector.lng ?? null);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const { isPending, updateSector } = useApiUpdateSector({
    idSector: sector.id,
    onSaved: () => {
      toast.success(t`Sector saved`);
      onClose?.();
    }
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    updateSector({
      name: name.trim(),
      description: description.trim(),
      lat: point?.lat ?? null,
      lng: point?.lng ?? null
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
      {children}
      <EditActions
        isPending={isPending}
        onCancel={onClose}
        leftAction={leftAction}
      />
    </EditFormStyled>
  );
};
