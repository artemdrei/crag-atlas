import { type FormEvent, type ReactNode, useEffect, useState } from 'react';

import type { Region } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';

import { coordsOf, toast, useLatinNames } from '@web/shared/lib';
import type { Coords } from '@web/shared/types';
import { ChangedTextField, NameFields } from '@web/shared/ui';

import { useApiUpdateRegion } from '../hooks';
import { CountryPicker } from './CountryPicker';
import { EditActions } from './EditActions';
import { EditFormStyled } from './EditFormStyled';

export interface Props {
  region: Region;
  point?: Coords;
  children?: ReactNode;
  onClose?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onPointChange?: (point?: Coords) => void;
  leftAction?: ReactNode;
}

export const RegionEditForm = ({
  region,
  point,
  children,
  onClose,
  onDirtyChange,
  onPointChange,
  leftAction
}: Props) => {
  const { t } = useLingui();
  const { name, nameLocal, isNameLatin, setName, setNameLocal, resetNames } =
    useLatinNames(region.name, region.nameLocal ?? '');
  const [country, setCountry] = useState<string | null>(region.country ?? null);
  const [rockType, setRockType] = useState(region.rockType);

  const isDirty =
    name !== region.name ||
    nameLocal !== (region.nameLocal ?? '') ||
    country !== (region.country ?? null) ||
    (point?.lat ?? null) !== (region.lat ?? null) ||
    (point?.lng ?? null) !== (region.lng ?? null) ||
    rockType !== region.rockType;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const { isPending, updateRegion } = useApiUpdateRegion({
    idRegion: region.id,
    onSaved: () => {
      onDirtyChange?.(false);
      toast.success(t`Region saved`);
      onClose?.();
    }
  });

  const handleCancel = () => {
    resetNames(region.name, region.nameLocal ?? '');
    setCountry(region.country ?? null);
    setRockType(region.rockType);
    onPointChange?.(coordsOf(region));
    onDirtyChange?.(false);
    onClose?.();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateRegion({
      name: name.trim(),
      nameLocal: nameLocal.trim() || null,
      country,
      rockType,
      lat: point?.lat ?? null,
      lng: point?.lng ?? null
    });
  };

  return (
    <EditFormStyled onSubmit={handleSubmit}>
      <CountryPicker
        value={country}
        isChanged={country !== (region.country ?? null)}
        onChange={setCountry}
      />
      <NameFields
        name={name}
        nameLocal={nameLocal}
        isNameChanged={name !== region.name}
        isNameLocalChanged={nameLocal !== (region.nameLocal ?? '')}
        onNameChange={setName}
        onNameLocalChange={setNameLocal}
      />
      <ChangedTextField
        fullWidth
        label={t`Rock type`}
        value={rockType}
        isChanged={rockType !== region.rockType}
        onChange={(event) => setRockType(event.target.value)}
      />
      {children}
      <EditActions
        isDisabled={
          !name.trim() ||
          !nameLocal.trim() ||
          !isNameLatin ||
          !country ||
          !point
        }
        isPending={isPending}
        isCancelDisabled={!isDirty && !onClose}
        onCancel={handleCancel}
        leftAction={leftAction}
      />
    </EditFormStyled>
  );
};
