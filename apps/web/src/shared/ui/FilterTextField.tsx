import { styled } from '@mui/material/styles';
import TextField, { type TextFieldProps } from '@mui/material/TextField';

export type Props = TextFieldProps & {
  isActive?: boolean;
};

export const FilterTextField = ({ isActive, ...props }: Props) => (
  <TextFieldStyled data-active={isActive || undefined} {...props} />
);

const TextFieldStyled = styled(TextField)`
  &[data-active] .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.primary.main};
  }

  &[data-active] .MuiInputLabel-root,
  &[data-active] .MuiSelect-select {
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;
