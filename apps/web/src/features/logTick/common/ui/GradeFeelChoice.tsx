import type { ReactNode } from 'react';

import type { GradeScale } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { gradeOptions } from '@web/shared/lib';

import type { GradeOpinion } from '../entities';

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
    <RowStyled>
      <FeelToggle
        value="soft"
        label={<Trans>Softer</Trans>}
        feel={feel}
        onFeelChange={onFeelChange}
      />

      <SelectStyled
        select
        size="small"
        label={t`Your grade`}
        value={grade}
        onChange={(event) => onGradeChange(event.target.value)}
      >
        {gradeOptions(scale).map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </SelectStyled>

      <FeelToggle
        value="hard"
        label={<Trans>Harder</Trans>}
        feel={feel}
        onFeelChange={onFeelChange}
      />
    </RowStyled>
  );
};

interface FeelToggleProps {
  value: GradeOpinion;
  label: ReactNode;
  feel: GradeOpinion | null;
  onFeelChange: (value: GradeOpinion | null) => void;
}

const FeelToggle = ({ value, label, feel, onFeelChange }: FeelToggleProps) => (
  <ToggleButtonGroup
    exclusive
    size="small"
    value={feel}
    onChange={(_event, next: GradeOpinion | null) => onFeelChange(next)}
  >
    <ToggleButton value={value}>{label}</ToggleButton>
  </ToggleButtonGroup>
);

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const SelectStyled = styled(TextField)`
  min-width: 104px;
`;
