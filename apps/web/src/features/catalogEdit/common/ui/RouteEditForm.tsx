import { type FormEvent, useState } from 'react';

import type { GradeScale, Route } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import {
  defaultGradeScale,
  gradeOptions,
  gradeScaleExample,
  gradeScaleName,
  gradeScalesForType
} from '@web/shared/lib';

import { useApiUpdateRoute } from '../hooks';
import { EditActions } from './EditActions';
import { EditFormStyled } from './EditFormStyled';

type RouteType = Route['type'];

const ROUTE_TYPES: RouteType[] = ['sport', 'boulder'];

export interface Props {
  route: Route;
  onClose: () => void;
}

export const RouteEditForm = ({ route, onClose }: Props) => {
  const { t } = useLingui();
  const [name, setName] = useState(route.name);
  const [grade, setGrade] = useState(route.grade);
  const [gradeScale, setGradeScale] = useState<GradeScale>(route.gradeScale);
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

  // A grade only means something inside its own scale, so switching systems
  // drops a grade the new one does not define.
  const changeScale = (next: GradeScale) => {
    setGradeScale(next);
    setGrade(gradeOptions(next).includes(grade) ? grade : '');
  };

  // Boulder and route scales are separate families, so the type decides which
  // systems are on offer — and drags the grade along when it changes.
  const changeType = (next: RouteType) => {
    setType(next);

    if (gradeScalesForType(next).includes(gradeScale)) return;

    setGradeScale(defaultGradeScale(next));
    setGrade('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    updateRoute({
      name: name.trim(),
      grade,
      gradeScale,
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
        select
        fullWidth
        label={t`Type`}
        value={type}
        onChange={(event) => changeType(event.target.value as RouteType)}
      >
        {ROUTE_TYPES.map((value) => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        fullWidth
        label={t`Grade system`}
        value={gradeScale}
        onChange={(event) => changeScale(event.target.value as GradeScale)}
      >
        {gradeScalesForType(type).map((value) => (
          <MenuItem key={value} value={value}>
            {`${gradeScaleName(value)} (${gradeScaleExample(value)})`}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        fullWidth
        label={t`Grade`}
        value={grade}
        onChange={(event) => setGrade(event.target.value)}
      >
        {gradeOptions(gradeScale).map((value) => (
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
