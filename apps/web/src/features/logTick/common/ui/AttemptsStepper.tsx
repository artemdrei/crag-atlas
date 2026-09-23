import { useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

export interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
}

export const AttemptsStepper = ({ value, onChange }: Props) => {
  const { t } = useLingui();

  const step = (delta: number) => {
    const next = (value ?? 0) + delta;

    onChange(next > 0 ? next : null);
  };

  return (
    <RowStyled>
      <IconButton
        size="small"
        aria-label={t`One less try`}
        disabled={!value}
        onClick={() => step(-1)}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <FieldStyled
        size="small"
        type="number"
        label={t`Tries`}
        value={value ?? ''}
        slotProps={{ htmlInput: { min: 1 } }}
        onChange={(event) => {
          const next = Number(event.target.value);

          onChange(next > 0 ? next : null);
        }}
      />
      <IconButton
        size="small"
        aria-label={t`One more try`}
        onClick={() => step(1)}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </RowStyled>
  );
};

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const FieldStyled = styled(TextField)`
  width: 96px;
`;
