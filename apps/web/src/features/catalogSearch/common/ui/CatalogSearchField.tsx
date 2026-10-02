import SearchIcon from '@mui/icons-material/Search';
import type { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

export interface Props {
  params: AutocompleteRenderInputParams;
  placeholder: string;
  isAutoFocused?: boolean;
  onBlur?: () => void;
}

export const CatalogSearchField = ({
  params,
  placeholder,
  isAutoFocused,
  onBlur
}: Props) => (
  <FieldStyled
    {...params}
    fullWidth
    size="small"
    autoFocus={isAutoFocused}
    placeholder={placeholder}
    slotProps={{
      ...params.slotProps,
      input: {
        ...params.slotProps.input,
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        )
      }
    }}
    onBlur={onBlur}
  />
);

const FieldStyled = styled(TextField)`
  & .MuiOutlinedInput-root {
    background-color: ${({ theme }) => theme.palette.background.paper};
  }
`;
