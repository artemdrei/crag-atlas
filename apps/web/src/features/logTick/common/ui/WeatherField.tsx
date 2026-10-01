import type { ReactNode } from 'react';

import { useLingui } from '@lingui/react/macro';
import UndoIcon from '@mui/icons-material/Undo';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

export interface Props {
  icon: ReactNode;
  label: string;
  unit: string;
  value?: number | null;
  min: number;
  max: number;
  isEdited: boolean;
  onChange: (value: number | null) => void;
  onReset: () => void;
}

export const WeatherField = ({
  icon,
  label,
  unit,
  value,
  min,
  max,
  isEdited,
  onChange,
  onReset
}: Props) => {
  const { t } = useLingui();

  return (
    <TextField
      fullWidth
      size="small"
      type="number"
      label={label}
      value={value ?? ''}
      onChange={(event) =>
        onChange(event.target.value === '' ? null : Number(event.target.value))
      }
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">{icon}</InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <UnitStyled>{unit}</UnitStyled>
              {isEdited && (
                <IconButton
                  size="small"
                  edge="end"
                  aria-label={t`Back to the measured value`}
                  onClick={onReset}
                >
                  <UndoIcon fontSize="small" />
                </IconButton>
              )}
            </InputAdornment>
          )
        },
        // `any`, not a step: a step makes the browser refuse 20.6 and offer
        // the two nearest multiples instead.
        htmlInput: { inputMode: 'decimal', step: 'any', min, max },
        inputLabel: { shrink: true }
      }}
    />
  );
};

const UnitStyled = styled('span')`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;
