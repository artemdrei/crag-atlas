import { type FormEvent, useState } from 'react';

import type { Sector } from '@crag-atlas/api';
import { TEXT_LIMITS } from '@crag-atlas/utils';
import { Trans, useLingui } from '@lingui/react/macro';

import { toast, useLatinNames } from '@web/shared/lib';
import { LimitedTextField, NameFields } from '@web/shared/ui';

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
  const { name, nameLocal, isNameLatin, setName, setNameLocal, resetNames } =
    useLatinNames();
  const [description, setDescription] = useState('');

  const isDirty = !!(name || nameLocal || description);

  const clear = () => {
    resetNames();
    setDescription('');
  };

  const { isPending, createSector } = useApiCreateSector({
    idRegion,
    onCreated: (sector) => {
      clear();
      toast.success(t`Sector ${sector.name} created`);
      onCreated?.(sector);
    }
  });

  const handleCancel = () => {
    clear();
    onClose?.();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    createSector({
      name: name.trim(),
      nameLocal: nameLocal.trim() || null,
      description: description.trim()
    });
  };

  return (
    <EditFormStyled onSubmit={handleSubmit}>
      <NameFields
        name={name}
        nameLocal={nameLocal}
        isCompact
        onNameChange={setName}
        onNameLocalChange={setNameLocal}
      />
      <LimitedTextField
        fullWidth
        multiline
        size="small"
        minRows={2}
        maxLength={TEXT_LIMITS.catalogDescription}
        label={t`Description`}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <EditActions
        submitLabel={<Trans>Add sector</Trans>}
        isPending={isPending}
        isDisabled={!name.trim() || !nameLocal.trim() || !isNameLatin}
        isCancelDisabled={!isDirty && !onClose}
        onCancel={handleCancel}
      />
    </EditFormStyled>
  );
};
