import type { ReactNode } from 'react';

import type { GradeScale } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import ButtonBase from '@mui/material/ButtonBase';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';

import { gradeOptions } from '@web/shared/lib';
import { CONTROL_RADIUS } from '@web/shared/theme/theme';

import type { GradeOpinion } from '../entities';
import { ControlTrack } from './ControlTrack';

export interface Props {
  feel: GradeOpinion | null;
  grade: string;
  scale: GradeScale;
  onFeelChange: (value: GradeOpinion | null) => void;
  onGradeChange: (value: string) => void;
}

export const GradeFeelChoice = ({
  feel,
  grade,
  scale,
  onFeelChange,
  onGradeChange
}: Props) => {
  const { t } = useLingui();

  return (
    <TrackStyled>
      <FeelSegment
        value="soft"
        label={<Trans>Softer</Trans>}
        feel={feel}
        onFeelChange={onFeelChange}
      />
      <GradeSelectStyled
        isSelected={feel === null}
        value={grade}
        input={<InputBase />}
        SelectDisplayProps={{ 'aria-label': t`Your grade` }}
        onChange={(event) => onGradeChange(event.target.value as string)}
      >
        {gradeOptions(scale).map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </GradeSelectStyled>
      <FeelSegment
        value="hard"
        label={<Trans>Harder</Trans>}
        feel={feel}
        onFeelChange={onFeelChange}
      />
    </TrackStyled>
  );
};

interface FeelSegmentProps {
  value: GradeOpinion;
  label: ReactNode;
  feel: GradeOpinion | null;
  onFeelChange: (value: GradeOpinion | null) => void;
}

const FeelSegment = ({
  value,
  label,
  feel,
  onFeelChange
}: FeelSegmentProps) => (
  <SegmentStyled
    type="button"
    aria-pressed={feel === value}
    isSelected={feel === value}
    onClick={() => onFeelChange(feel === value ? null : value)}
  >
    {label}
  </SegmentStyled>
);

const TrackStyled = styled(ControlTrack)`
  display: inline-grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0;
  padding: 3px;
`;

const SegmentStyled = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'isSelected'
})<{ isSelected: boolean }>`
  height: 32px;
  padding: ${({ theme }) => theme.spacing(0, 1)};
  border-radius: ${CONTROL_RADIUS}px;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  white-space: nowrap;
  font-weight: ${({ isSelected }) => (isSelected ? 700 : 400)};
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.palette.text.primary : theme.palette.text.secondary};
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.palette.action.selected : 'transparent'};
`;

const GradeSelectStyled = styled(Select, {
  shouldForwardProp: (prop) => prop !== 'isSelected'
})<{ isSelected: boolean }>`
  border-radius: ${CONTROL_RADIUS}px;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: 700;
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.palette.text.primary : theme.palette.text.secondary};
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.palette.action.selected : 'transparent'};

  /* MUI reserves 32px on the right for the arrow, which is hidden here. */
  && .MuiSelect-select.MuiSelect-select {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    min-width: 0;
    box-sizing: border-box;
    padding: ${({ theme }) => theme.spacing(0, 1.25)};
  }

  & .MuiSelect-icon {
    display: none;
  }
`;
