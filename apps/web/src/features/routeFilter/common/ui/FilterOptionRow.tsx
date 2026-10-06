import type { ReactNode } from 'react';

import { alpha, styled } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

export interface Props<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  labelOf: (option: T) => ReactNode;
  onChange: (value: T) => void;
}

export const FilterOptionRow = <T extends string>({
  label,
  value,
  options,
  labelOf,
  onChange
}: Props<T>) => (
  <RowStyled>
    <LabelStyled variant="caption" color="text.secondary">
      {label}
    </LabelStyled>
    <ToggleButtonGroupStyled
      exclusive
      size="small"
      aria-label={label}
      value={value}
      onChange={(_event, next: T | null) => next && onChange(next)}
    >
      {options.map((option) => (
        <ToggleButtonStyled key={option} value={option}>
          {labelOf(option)}
        </ToggleButtonStyled>
      ))}
    </ToggleButtonGroupStyled>
  </RowStyled>
);

const RowStyled = styled('div')`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const LabelStyled = styled(Typography)`
  grid-column: 1;
`;

const ToggleButtonGroupStyled = styled(ToggleButtonGroup)`
  grid-column: 2;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(0.5)};

  & .MuiToggleButtonGroup-grouped {
    flex: 1 0 auto;
    margin: 0;
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: 999px;
  }
`;

const ToggleButtonStyled = styled(ToggleButton)`
  padding: ${({ theme }) => theme.spacing(0.25, 1.25)};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  text-transform: none;
  white-space: nowrap;

  &.Mui-selected,
  &.Mui-selected:hover {
    border-color: ${({ theme }) => alpha(theme.palette.primary.main, 0.5)};
    background-color: ${({ theme }) => alpha(theme.palette.primary.main, 0.12)};
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;
