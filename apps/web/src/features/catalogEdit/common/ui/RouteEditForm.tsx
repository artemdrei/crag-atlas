import { type FormEvent, useState } from 'react';

import type { Route } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useApiUpdateRoute } from '../hooks';
import { EditActions } from './EditActions';
import { EditFormStyled } from './EditFormStyled';

type RouteType = Route['type'];

const ROUTE_TYPES: RouteType[] = ['sport', 'trad', 'boulder'];

export interface Props {
  route: Route;
  onClose: () => void;
}

export const RouteEditForm = ({ route, onClose }: Props) => {
  const { t } = useLingui();
  const [name, setName] = useState(route.name);
  const [grade, setGrade] = useState(route.grade);
  const [type, setType] = useState<RouteType>(route.type);
  const [length, setLength] = useState(
    route.length ? String(route.length) : ''
  );
  const [boltsCount, setBoltsCount] = useState(
    route.boltsCount ? String(route.boltsCount) : ''
  );
  const [description, setDescription] = useState(route.description);

  const { isPending, updateRoute } = useApiUpdateRoute({
    idRoute: route.id,
    idSector: route.idSector,
    onSaved: onClose
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    updateRoute({
      name: name.trim(),
      grade: grade.trim(),
      type,
      // Empty means unknown; the database keeps null rather than a made-up 0.
      length: length ? Number(length) : null,
      boltsCount: boltsCount ? Number(boltsCount) : null,
      description: description.trim()
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
        label={t`Grade`}
        value={grade}
        onChange={(event) => setGrade(event.target.value)}
      />
      <TextField
        select
        fullWidth
        label={t`Type`}
        value={type}
        onChange={(event) => setType(event.target.value as RouteType)}
      >
        {ROUTE_TYPES.map((value) => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        type="number"
        label={t`Length, m`}
        value={length}
        slotProps={{ htmlInput: { min: 1 } }}
        onChange={(event) => setLength(event.target.value)}
      />
      <TextField
        fullWidth
        type="number"
        label={t`Bolts`}
        value={boltsCount}
        slotProps={{ htmlInput: { min: 0 } }}
        onChange={(event) => setBoltsCount(event.target.value)}
      />
      <TextField
        fullWidth
        multiline
        minRows={2}
        label={t`Description`}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <EditActions isPending={isPending} onCancel={onClose} />
    </EditFormStyled>
  );
};
