import type { ChangeEvent } from 'react';

import { styled } from '@mui/material/styles';

import {
  ChangedTextField,
  type Props as ChangedTextFieldProps
} from './ChangedTextField';

const COUNTER_FROM_RATIO = 0.8;

export type Props = ChangedTextFieldProps & {
  maxLength: number;
  value: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

export const LimitedTextField = ({
  maxLength,
  value,
  helperText,
  slotProps,
  onChange,
  ...props
}: Props) => {
  const length = value.length;
  const isAtLimit = length >= maxLength;
  const isCounterShown = length >= maxLength * COUNTER_FROM_RATIO;

  return (
    <TextFieldStyled
      {...props}
      value={value}
      data-at-limit={isAtLimit || undefined}
      slotProps={{
        ...slotProps,
        htmlInput: { ...slotProps?.htmlInput, maxLength }
      }}
      helperText={
        (helperText || isCounterShown) && (
          <HelperStyled>
            <span>{helperText}</span>
            {isCounterShown && (
              <CounterStyled aria-live="polite">
                {length} / {maxLength}
              </CounterStyled>
            )}
          </HelperStyled>
        )
      }
      onChange={onChange}
    />
  );
};

const TextFieldStyled = styled(ChangedTextField)`
  &[data-at-limit] .MuiOutlinedInput-notchedOutline {
    border-width: 2px;
    border-color: ${({ theme }) => theme.palette.warning.main};
  }

  &[data-at-limit] .MuiFormHelperText-root {
    color: ${({ theme }) => theme.palette.warning.main};
  }
`;

const HelperStyled = styled('span')`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const CounterStyled = styled('span')`
  flex-shrink: 0;
  margin-left: auto;
  font-variant-numeric: tabular-nums;
`;
