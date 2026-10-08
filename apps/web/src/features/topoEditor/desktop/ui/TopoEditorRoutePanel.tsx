import type { ReactNode } from 'react';

import type { GradeScale, Route } from '@crag-atlas/api';
import { TEXT_LIMITS } from '@crag-atlas/utils';
import { Trans, useLingui } from '@lingui/react/macro';
import RedoIcon from '@mui/icons-material/Redo';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
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
import { ClimberPicker } from '@web/features/climberPicker';
import {
  defaultGradeScale,
  digitsOnly,
  followLatin,
  gradeOptions,
  gradeScaleExample,
  gradeScaleName,
  gradeScalesForType,
  isNameLatin
} from '@web/shared/lib';
import {
  ChangedTextField,
  DangerButton,
  LimitedTextField,
  NameFields
} from '@web/shared/ui';

import type { ChangedRouteFields, RouteDraft } from '../../common';

export interface PhotoOption {
  id: string;
  label: string;
}

export interface Props {
  route: RouteDraft;
  changed: ChangedRouteFields;
  photos: PhotoOption[];
  idPhoto?: string;
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
  onReset: () => void;
  onSave: () => void;
  onRemoveLine: () => void;
  onMoveToPhoto: (idTopo: string) => void;
  onDelete: () => void;
}

export const TopoEditorRoutePanel = ({
  route,
  changed,
  photos,
  idPhoto,
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
  onReset,
  onSave,
  onRemoveLine,
  onMoveToPhoto,
  onDelete
}: Props) => {
  const { t } = useLingui();
  const { openModal } = useModal();

  const isNameValid = isNameLatin(route.name);
  const canSave =
    !!route.name.trim() &&
    !!route.nameLocal.trim() &&
    isNameValid &&
    !!route.grade;

  const askRemoveLine = () =>
    openModal('DELETE_TOPO_LINE', {
      routeName: route.name.trim() || t`this route`,
      onConfirm: onRemoveLine
    });

  const askDelete = () =>
    openModal('ARCHIVE_ROUTE', {
      routeName: route.name.trim() || t`This route`,
      grade: route.grade,
      gradeScale: route.gradeScale,
      isNew: route.isNew,
      onConfirm: onDelete
    });

  const changeScale = (next: GradeScale) => {
    onChange({
      gradeScale: next,
      grade: gradeOptions(next).includes(route.grade) ? route.grade : ''
    });
  };

  const changeLocalName = (value: string) => {
    onChange(followLatin(route.name, route.nameLocal, value));
  };

  const changeType = (next: Route['type']) => {
    if (gradeScalesForType(next).includes(route.gradeScale)) {
      onChange({ type: next });
      return;
    }

    onChange({ type: next, gradeScale: defaultGradeScale(next), grade: '' });
  };

  return (
    <PanelStyled>
      <HeaderStyled>
        <HistoryRowStyled>
          <HistoryButton
            label={t`Undo`}
            icon={<UndoIcon fontSize="small" />}
            isDisabled={!canUndo}
            onClick={onUndo}
          />
          <HistoryButton
            label={t`Redo`}
            icon={<RedoIcon fontSize="small" />}
            isDisabled={!canRedo}
            onClick={onRedo}
          />
          <Divider orientation="vertical" flexItem />
          <HistoryButton
            label={t`Reset to the saved state`}
            icon={<RestartAltIcon fontSize="small" />}
            isDisabled={!isDirty || route.isNew || isBusy}
            onClick={onReset}
          />
          <Divider orientation="vertical" flexItem />
          <Tooltip title={t`Reader view`}>
            <PreviewButtonStyled
              aria-label={t`Reader view`}
              isActive={isPreview}
              onClick={onTogglePreview}
            >
              <VisibilityIcon fontSize="small" />
            </PreviewButtonStyled>
          </Tooltip>
        </HistoryRowStyled>
        <Typography variant="subtitle2">
          {route.isNew ? (
            <Trans>New route</Trans>
          ) : number ? (
            <Trans>Route №{number}</Trans>
          ) : (
            <Trans>Route not on the wall yet</Trans>
          )}
        </Typography>
      </HeaderStyled>
      <BodyStyled>
        <NameFields
          name={route.name}
          nameLocal={route.nameLocal}
          isNameChanged={changed.name}
          isNameLocalChanged={changed.nameLocal}
          isCompact
          onNameChange={(name) => onChange({ name })}
          onNameLocalChange={changeLocalName}
        />
        <TextField
          select
          size="small"
          label={t`Photo`}
          value={idPhoto ?? ''}
          disabled={!idPhoto || isBusy}
          helperText={
            idPhoto
              ? undefined
              : t`Draw the route first, then it can move between photos.`
          }
          onChange={({ target }) => onMoveToPhoto(target.value)}
        >
          {photos.map((photo) => (
            <MenuItem key={photo.id} value={photo.id}>
              {photo.label}
            </MenuItem>
          ))}
        </TextField>
        <Divider />
        <TypeGroupStyled
          exclusive
          size="small"
          data-changed={changed.type || undefined}
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
        </TypeGroupStyled>
        <RowStyled>
          <ChangedTextField
            select
            size="small"
            label={t`System`}
            value={route.gradeScale}
            isChanged={changed.gradeScale}
            onChange={({ target }) => changeScale(target.value as GradeScale)}
          >
            {gradeScalesForType(route.type).map((scale) => (
              <MenuItem key={scale} value={scale}>
                {`${gradeScaleName(scale)} (${gradeScaleExample(scale)})`}
              </MenuItem>
            ))}
          </ChangedTextField>
          <ChangedTextField
            select
            size="small"
            label={t`Grade`}
            value={route.grade}
            isChanged={changed.grade}
            onChange={({ target }) => onChange({ grade: target.value })}
          >
            {gradeOptions(route.gradeScale).map((grade) => (
              <MenuItem key={grade} value={grade}>
                {grade}
              </MenuItem>
            ))}
          </ChangedTextField>
          <ChangedTextField
            size="small"
            label={t`Length, m`}
            value={route.length}
            isChanged={changed.length}
            slotProps={{ htmlInput: { inputMode: 'numeric' } }}
            onChange={({ target }) =>
              onChange({ length: digitsOnly(target.value) })
            }
          />
          {route.type === 'sport' && (
            <ChangedTextField
              size="small"
              label={t`Bolts`}
              value={route.boltsCount}
              isChanged={changed.boltsCount}
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              onChange={({ target }) =>
                onChange({ boltsCount: digitsOnly(target.value) })
              }
            />
          )}
        </RowStyled>
        <Divider />
        <Typography variant="overline" color="text.secondary">
          <Trans>Bolted by</Trans>
        </Typography>
        <ClimberPicker
          value={route.bolter}
          label={t`Climber with an account`}
          isChanged={changed.bolter}
          onChange={(bolter) => onChange({ bolter, bolterName: '' })}
        />
        <RowStyled>
          <ChangedTextField
            size="small"
            label={t`Or a name`}
            value={route.bolterName}
            isChanged={changed.bolterName}
            disabled={!!route.bolter}
            helperText={
              route.bolter
                ? t`Clear the climber above to type a name`
                : undefined
            }
            onChange={({ target }) => onChange({ bolterName: target.value })}
          />
          <ChangedTextField
            size="small"
            label={t`Year`}
            value={route.boltedYear}
            isChanged={changed.boltedYear}
            slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 4 } }}
            onChange={({ target }) =>
              onChange({ boltedYear: digitsOnly(target.value) })
            }
          />
        </RowStyled>
        <Divider />
        <LimitedTextField
          size="small"
          multiline
          minRows={3}
          maxLength={TEXT_LIMITS.catalogDescription}
          label={t`Description`}
          value={route.description}
          isChanged={changed.description}
          onChange={({ target }) => onChange({ description: target.value })}
        />
      </BodyStyled>
      <FooterStyled>
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
          <DangerButtonStyled
            color="error"
            disabled={isBusy}
            onClick={askDelete}
          >
            <Trans>Archive route</Trans>
          </DangerButtonStyled>
        </DangerRowStyled>
      </FooterStyled>
    </PanelStyled>
  );
};

interface HistoryButtonProps {
  label: string;
  icon: ReactNode;
  isDisabled: boolean;
  onClick: () => void;
}

// A disabled button fires no pointer events; the tooltip needs a wrapper.
const HistoryButton = ({
  label,
  icon,
  isDisabled,
  onClick
}: HistoryButtonProps) => (
  <Tooltip title={label}>
    <span>
      <IconButton aria-label={label} disabled={isDisabled} onClick={onClick}>
        {icon}
      </IconButton>
    </span>
  </Tooltip>
);

const PanelStyled = styled('div')`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;

  hr {
    margin: ${({ theme }) => theme.spacing(0.5, 0)};
  }
`;

const HeaderStyled = styled('div')`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
`;

const BodyStyled = styled('div')`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 0;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(2, 0)};
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const RowStyled = styled('div')`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing(2, 1)};
`;

const HistoryRowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const PreviewButtonStyled = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isActive'
})<{ isActive: boolean }>`
  color: ${({ theme, isActive }) =>
    isActive ? theme.palette.text.primary : theme.palette.action.disabled};
`;

const FooterStyled = styled('div')`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(1.5)};
`;

const DangerRowStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const DangerButtonStyled = styled(DangerButton)`
  flex: 1 1 50%;
  min-width: 0;
`;

const TypeGroupStyled = styled(ToggleButtonGroup)`
  &[data-changed] .MuiToggleButton-root {
    border-color: ${({ theme }) => theme.palette.warning.main};
  }
`;
