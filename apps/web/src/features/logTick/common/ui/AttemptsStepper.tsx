import { useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import { styled } from '@mui/material/styles';

import { CONTROL_RADIUS } from '@web/shared/theme/theme';

import { ControlTrack } from './ControlTrack';

export interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
}

export const AttemptsStepper = ({ value, onChange }: Props) => {
  const { t } = useLingui();

  const step = (delta: number) => {
    const next = Math.min((value ?? 0) + delta, MAX_TRIES);

    onChange(next > 0 ? next : null);
  };

  return (
    <ControlTrack>
      <StepButtonStyled
        aria-label={t`One less try`}
        disabled={!value || value <= 1}
        onClick={() => step(-1)}
      >
        <RemoveIcon fontSize="small" />
      </StepButtonStyled>
      <InputStyled
        type="number"
        value={value ?? ''}
        inputProps={{ min: 1, max: MAX_TRIES, 'aria-label': t`Tries` }}
        onChange={(event) => {
          const next = Number(event.target.value.slice(0, 2));

          onChange(next > 0 ? next : null);
        }}
      />
      <AddButtonStyled aria-label={t`One more try`} onClick={() => step(1)}>
        <AddIcon fontSize="small" />
      </AddButtonStyled>
    </ControlTrack>
  );
};

const MAX_TRIES = 99;

const StepButtonStyled = styled(IconButton)`
  width: 32px;
  height: 32px;
  border-radius: ${CONTROL_RADIUS}px;
`;

const AddButtonStyled = styled(StepButtonStyled)`
  background: ${({ theme }) => theme.palette.action.selected};
`;

const InputStyled = styled(InputBase)`
  width: 28px;
  font-size: ${({ theme }) => theme.typography.subtitle1.fontSize};
  font-weight: 700;

  & input {
    padding: 0;
    text-align: center;
    -moz-appearance: textfield;
  }

  & input::-webkit-outer-spin-button,
  & input::-webkit-inner-spin-button {
    margin: 0;
    -webkit-appearance: none;
  }
`;
