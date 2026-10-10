import { useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

export interface Props {
  climbedAt: string;
  climbedAtTime: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}

export const ClimbedAtFields = ({
  climbedAt,
  climbedAtTime,
  onDateChange,
  onTimeChange
}: Props) => {
  const { t } = useLingui();

  return (
    <RowStyled>
      <TextField
        required
        fullWidth
        size="small"
        type="date"
        label={t`Date`}
        value={climbedAt}
        slotProps={{ inputLabel: { shrink: true } }}
        onChange={(event) => onDateChange(event.target.value)}
      />
      <TextField
        fullWidth
        size="small"
        type="time"
        label={t`Time`}
        value={climbedAtTime}
        slotProps={{ inputLabel: { shrink: true } }}
        onChange={(event) => onTimeChange(event.target.value)}
      />
    </RowStyled>
  );
};

const RowStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;
