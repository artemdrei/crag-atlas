import { styled } from '@mui/material/styles';
import TextField, { type TextFieldProps } from '@mui/material/TextField';

export type Props = TextFieldProps & {
  /** Differs from what the server holds, so it is about to be saved. */
  isChanged?: boolean;
};

export const ChangedTextField = ({ isChanged, ...props }: Props) => (
  <TextFieldStyled data-changed={isChanged || undefined} {...props} />
);

// A focused field states itself in the accent colour, so the mark steps aside
// while the cursor is in it.
const TextFieldStyled = styled(TextField)`
  &[data-changed]:not(:focus-within) .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.warning.main};
  }

  &[data-changed]:not(:focus-within) .MuiInputLabel-root {
    color: ${({ theme }) => theme.palette.warning.main};
  }
`;
