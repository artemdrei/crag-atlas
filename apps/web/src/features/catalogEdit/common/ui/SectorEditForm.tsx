import { type FormEvent, type ReactNode, useEffect, useState } from 'react';

import type { Sector } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';

import { coordsOf, toast, useLatinNames } from '@web/shared/lib';
import type { Coords } from '@web/shared/types';
import { ChangedTextField, NameFields } from '@web/shared/ui';

import { useApiUpdateSector } from '../hooks';
import { EditActions } from './EditActions';
import { EditFormStyled } from './EditFormStyled';

export interface Props {
  sector: Sector;
  point?: Coords;
  children?: ReactNode;
  onClose?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onPointChange?: (point?: Coords) => void;
  leftAction?: ReactNode;
}

export const SectorEditForm = ({
  sector,
  point,
  children,
  onClose,
  onDirtyChange,
  onPointChange,
  leftAction
}: Props) => {
  const { t } = useLingui();
  const { name, nameLocal, isNameLatin, setName, setNameLocal, resetNames } =
    useLatinNames(sector.name, sector.nameLocal ?? '');
  const [description, setDescription] = useState(sector.description);

  const isDirty =
    name !== sector.name ||
    nameLocal !== (sector.nameLocal ?? '') ||
    description !== sector.description ||
    (point?.lat ?? null) !== (sector.lat ?? null) ||
    (point?.lng ?? null) !== (sector.lng ?? null);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const { isPending, updateSector } = useApiUpdateSector({
    idSector: sector.id,
    onSaved: () => {
      onDirtyChange?.(false);
      toast.success(t`Sector saved`);
      onClose?.();
    }
  });

  const handleCancel = () => {
    resetNames(sector.name, sector.nameLocal ?? '');
    setDescription(sector.description);
    onPointChange?.(coordsOf(sector));
    onDirtyChange?.(false);
    onClose?.();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    updateSector({
      name: name.trim(),
      nameLocal: nameLocal.trim() || null,
      description: description.trim(),
      lat: point?.lat ?? null,
      lng: point?.lng ?? null
    });
  };

  return (
    <EditFormStyled onSubmit={handleSubmit}>
      <NameFields
        name={name}
        nameLocal={nameLocal}
        isNameChanged={name !== sector.name}
        isNameLocalChanged={nameLocal !== (sector.nameLocal ?? '')}
        onNameChange={setName}
        onNameLocalChange={setNameLocal}
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
        isDisabled={!name.trim() || !nameLocal.trim() || !isNameLatin || !point}
        isPending={isPending}
        isCancelDisabled={!isDirty && !onClose}
        onCancel={handleCancel}
        leftAction={leftAction}
      />
    </EditFormStyled>
  );
};
