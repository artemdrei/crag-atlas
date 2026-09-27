import { type FormEvent, type ReactNode, useEffect, useState } from 'react';

import type { Region } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';

import { toast } from '@web/shared/lib';
import { ChangedTextField } from '@web/shared/ui';

import { useApiUpdateRegion } from '../hooks';
import { CountryPicker } from './CountryPicker';
import { EditActions } from './EditActions';
import { EditFormStyled } from './EditFormStyled';

export interface Props {
  region: Region;
  onClose?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  leftAction?: ReactNode;
}

export const RegionEditForm = ({
  region,
  onClose,
  onDirtyChange,
  leftAction
}: Props) => {
  const { t } = useLingui();
  const [name, setName] = useState(region.name);
  const [province, setProvince] = useState(region.province);
  const [country, setCountry] = useState<string | null>(region.country ?? null);
  const [rockType, setRockType] = useState(region.rockType);

  const isDirty =
    name !== region.name ||
    province !== region.province ||
    country !== (region.country ?? null) ||
    rockType !== region.rockType;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const { isPending, updateRegion } = useApiUpdateRegion({
    idRegion: region.id,
    onSaved: () => {
      toast.success(t`Region saved`);
      onClose?.();
    }
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateRegion({ name: name.trim(), province, country, rockType });
  };

  return (
    <EditFormStyled onSubmit={handleSubmit}>
      <CountryPicker
        value={country}
        isChanged={country !== (region.country ?? null)}
        onChange={setCountry}
      />
      <ChangedTextField
        fullWidth
        label={t`Name`}
        value={name}
        isChanged={name !== region.name}
        onChange={(event) => setName(event.target.value)}
      />
      <ChangedTextField
        fullWidth
        label={t`Province`}
        value={province}
        isChanged={province !== region.province}
        onChange={(event) => setProvince(event.target.value)}
      />
      <ChangedTextField
        fullWidth
        label={t`Rock type`}
        value={rockType}
        isChanged={rockType !== region.rockType}
        onChange={(event) => setRockType(event.target.value)}
      />
      <EditActions
        isPending={isPending}
        onCancel={onClose}
        leftAction={leftAction}
      />
    </EditFormStyled>
  );
};
