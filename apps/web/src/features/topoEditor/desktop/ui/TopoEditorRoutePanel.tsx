import type { GradeScale, Route } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useModal } from '@web/app/providers';
import {
  defaultGradeScale,
  digitsOnly,
  gradeOptions,
  gradeScaleExample,
  gradeScaleName,
  gradeScalesForType
} from '@web/shared/lib';

import type { RouteDraft } from '../../common';

export interface Props {
  route: RouteDraft;
  number?: number;
  hasLine: boolean;
  isDirty: boolean;
  isBusy: boolean;
  isPreview: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onChange: (patch: Partial<RouteDraft>) => void;
  onTogglePreview: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onRemoveLine: () => void;
  onDelete: () => void;
}

export const TopoEditorRoutePanel = ({
  route,
  number,
  hasLine,
  isDirty,
  isBusy,
  isPreview,
  canUndo,
  canRedo,
  onChange,
  onTogglePreview,
  onUndo,
  onRedo,
  onSave,
  onRemoveLine,
  onDelete
}: Props) => {
  const { t } = useLingui();
  const { openModal } = useModal();
  const canSave = !!route.name.trim() && !!route.grade;

  // Both deletions are immediate and public, so they go through a dialog that
  // spells out what disappears.
  const askRemoveLine = () =>
    openModal('DELETE_TOPO_LINE', {
      routeName: route.name.trim() || t`this route`,
      onConfirm: onRemoveLine
    });

  const askDelete = () =>
    openModal('DELETE_ROUTE', {
      routeName: route.name.trim() || t`This route`,
      isNew: route.isNew,
      onConfirm: onDelete
    });

  // A grade belongs to its scale, so switching systems drops one the new
  // scale does not define.
  const changeScale = (next: GradeScale) => {
    onChange({
      gradeScale: next,
      grade: gradeOptions(next).includes(route.grade) ? route.grade : ''
    });
  };

  // Boulder and route scales are separate families, so the type decides which
  // systems are even on offer — and drags the grade along when it changes.
  const changeType = (next: Route['type']) => {
    if (gradeScalesForType(next).includes(route.gradeScale)) {
      onChange({ type: next });
      return;
    }

    onChange({ type: next, gradeScale: defaultGradeScale(next), grade: '' });
  };

  return (
    <PanelStyled>
      <Typography variant="subtitle2">
        {route.isNew ? (
          <Trans>New route</Trans>
        ) : number ? (
          <Trans>Route №{number}</Trans>
        ) : (
          <Trans>Route not on the wall yet</Trans>
        )}
      </Typography>
      <TextField
        size="small"
        label={t`Name`}
        value={route.name}
        onChange={({ target }) => onChange({ name: target.value })}
      />
      <Divider />
      <ToggleButtonGroup
        exclusive
        size="small"
        value={route.type}
        onChange={(_event, type: Route['type'] | null) =>
          type && changeType(type)
        }
      >
        <ToggleButton value="sport">
          <Trans>Sport</Trans>
        </ToggleButton>
        <ToggleButton value="boulder">
          <Trans>Boulder</Trans>
        </ToggleButton>
      </ToggleButtonGroup>
      <RowStyled>
        <TextField
          select
          size="small"
          label={t`System`}
          value={route.gradeScale}
          onChange={({ target }) => changeScale(target.value as GradeScale)}
        >
          {gradeScalesForType(route.type).map((scale) => (
            <MenuItem key={scale} value={scale}>
              {`${gradeScaleName(scale)} (${gradeScaleExample(scale)})`}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label={t`Grade`}
          value={route.grade}
          onChange={({ target }) => onChange({ grade: target.value })}
        >
          {gradeOptions(route.gradeScale).map((grade) => (
            <MenuItem key={grade} value={grade}>
              {grade}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label={t`Length, m`}
          value={route.length}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          onChange={({ target }) =>
            onChange({ length: digitsOnly(target.value) })
          }
        />
        {route.type === 'sport' && (
          <TextField
            size="small"
            label={t`Bolts`}
            value={route.boltsCount}
            slotProps={{ htmlInput: { inputMode: 'numeric' } }}
            onChange={({ target }) =>
              onChange({ boltsCount: digitsOnly(target.value) })
            }
          />
        )}
      </RowStyled>
      <Divider />
      <TextField
        size="small"
        multiline
        minRows={3}
        label={t`Description`}
        value={route.description}
        onChange={({ target }) => onChange({ description: target.value })}
      />
      <HistoryRowStyled>
        {/* A disabled button fires no pointer events, so the tooltip needs a
            wrapper that still does. */}
        <Tooltip title={t`Undo`}>
          <span>
            <IconButton
              aria-label={t`Undo`}
              disabled={!canUndo}
              onClick={onUndo}
            >
              <UndoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t`Redo`}>
          <span>
            <IconButton
              aria-label={t`Redo`}
              disabled={!canRedo}
              onClick={onRedo}
            >
              <RedoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Tooltip title={t`Reader view`}>
          <IconButton
            aria-label={t`Reader view`}
            color={isPreview ? 'primary' : 'default'}
            onClick={onTogglePreview}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </HistoryRowStyled>
      <Typography variant="caption" color="text.secondary">
        <Trans>Saved changes go live for everyone straight away.</Trans>
      </Typography>
      <Button
        variant="contained"
        disabled={!canSave || (!isDirty && !route.isNew) || isBusy}
        onClick={onSave}
      >
        {route.isNew ? (
          <Trans>Create route</Trans>
        ) : (
          <Trans>Save changes</Trans>
        )}
      </Button>
      <DangerRowStyled>
        <DangerButtonStyled
          color="error"
          disabled={!hasLine || isBusy}
          onClick={askRemoveLine}
        >
          <Trans>Delete line</Trans>
        </DangerButtonStyled>
        <DangerButtonStyled color="error" disabled={isBusy} onClick={askDelete}>
          <Trans>Delete route</Trans>
        </DangerButtonStyled>
      </DangerRowStyled>
    </PanelStyled>
  );
};

const PanelStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 0;
  overflow-y: auto;

  hr {
    margin: ${({ theme }) => theme.spacing(0.5, 0)};
  }
`;

// Two per row: the system name needs the width, and length sits next to bolts.
const RowStyled = styled('div')`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  /* The floating label sits on the field's top border, so rows need more
     room between them than columns do. */
  gap: ${({ theme }) => theme.spacing(2, 1)};
`;

const HistoryRowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
`;

const DangerRowStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const DangerButtonStyled = styled(Button)`
  flex: 1 1 50%;
  min-width: 0;
  opacity: 0.5;
  transition: opacity 0.15s ease-out;

  &:hover {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.25;
  }
`;
