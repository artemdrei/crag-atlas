import { type FormEvent, type ReactNode, useEffect, useState } from 'react';

import type { Sector, Shelter } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

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
  const [aspectDeg, setAspectDeg] = useState(
    sector.aspectDeg?.toString() ?? ''
  );
  const [shelter, setShelter] = useState<Shelter>(sector.shelter);

  const isDirty =
    name !== sector.name ||
    nameLocal !== (sector.nameLocal ?? '') ||
    description !== sector.description ||
    (point?.lat ?? null) !== (sector.lat ?? null) ||
    (point?.lng ?? null) !== (sector.lng ?? null) ||
    toAspect(aspectDeg) !== (sector.aspectDeg ?? null) ||
    shelter !== sector.shelter;

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
    setAspectDeg(sector.aspectDeg?.toString() ?? '');
    setShelter(sector.shelter);
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
      lng: point?.lng ?? null,
      aspectDeg: toAspect(aspectDeg),
      shelter
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
      <RowStyled>
        <TextField
          fullWidth
          type="number"
          label={t`Wall orientation, °`}
          helperText={t`Which way the wall faces, in compass degrees: 0 north, 90 east, 180 south, 270 west. It sets when the wall is in sun or shade. Leave it empty to work it out from the terrain.`}
          value={aspectDeg}
          slotProps={{ htmlInput: { min: 0, max: 359 } }}
          onChange={(event) => setAspectDeg(event.target.value)}
        />
        <TextField
          select
          fullWidth
          label={t`Rain shelter`}
          helperText={t`Whether the wall stays dry in rain. The conditions forecast keeps a sheltered sector climbable on a wet day.`}
          value={shelter}
          onChange={(event) => setShelter(event.target.value as Shelter)}
        >
          <MenuItem value="open">{t`Open: gets wet in rain`}</MenuItem>
          <MenuItem value="partial">
            {t`Partly sheltered: some routes stay dry`}
          </MenuItem>
          <MenuItem value="full">
            {t`Fully sheltered: a roof or overhang keeps it dry`}
          </MenuItem>
        </TextField>
      </RowStyled>
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

const RowStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1.5)};

  & > * {
    flex: 1 1 180px;
  }
`;

// An empty field means "work it out from the terrain", which is not the same
// as north.
const toAspect = (value: string): number | null => {
  const parsed = Number.parseInt(value, 10);

  return Number.isNaN(parsed) ? null : ((parsed % 360) + 360) % 360;
};
