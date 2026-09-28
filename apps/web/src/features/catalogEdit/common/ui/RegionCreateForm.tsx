import { type FormEvent, type ReactNode, useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import TextField from '@mui/material/TextField';

import { toast, useLatinNames } from '@web/shared/lib';
import type { Coords } from '@web/shared/types';
import { NameFields } from '@web/shared/ui';

import { useApiCreateRegion } from '../hooks';
import { CountryPicker } from './CountryPicker';
import { EditActions } from './EditActions';
import { EditFormStyled } from './EditFormStyled';

export interface Props {
  point?: Coords;
  children?: ReactNode;
  onClose?: () => void;
  onPointChange?: (point?: Coords) => void;
}

export const RegionCreateForm = ({
  point,
  children,
  onClose,
  onPointChange
}: Props) => {
  const { t } = useLingui();
  const { name, nameLocal, isNameLatin, setName, setNameLocal, resetNames } =
    useLatinNames();
  const [country, setCountry] = useState<string | null>(null);
  const [rockType, setRockType] = useState('');

  const isDirty = !!(name || nameLocal || country || rockType || point);

  const clear = () => {
    resetNames();
    setCountry(null);
    setRockType('');
  };

  const { isPending, createRegion } = useApiCreateRegion({
    onCreated: (region) => {
      clear();
      toast.success(t`Region ${region.name} created`);
    }
  });

  const handleCancel = () => {
    clear();
    onPointChange?.(undefined);
    onClose?.();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    createRegion({
      name: name.trim(),
      nameLocal: nameLocal.trim() || null,
      country,
      rockType: rockType.trim(),
      lat: point?.lat ?? null,
      lng: point?.lng ?? null
    });
  };

  return (
    <EditFormStyled onSubmit={handleSubmit}>
      <CountryPicker isCompact value={country} onChange={setCountry} />
      <NameFields
        name={name}
        nameLocal={nameLocal}
        isCompact
        onNameChange={setName}
        onNameLocalChange={setNameLocal}
      />
      <TextField
        fullWidth
        size="small"
        label={t`Rock type`}
        value={rockType}
        onChange={(event) => setRockType(event.target.value)}
      />
      {children}
      <EditActions
        submitLabel={<Trans>Add region</Trans>}
        isPending={isPending}
        isDisabled={
          !name.trim() ||
          !nameLocal.trim() ||
          !isNameLatin ||
          !country ||
          !point
        }
        isCancelDisabled={!isDirty && !onClose}
        onCancel={handleCancel}
      />
    </EditFormStyled>
  );
};
