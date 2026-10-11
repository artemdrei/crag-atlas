import { useLingui } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

export interface Props {
  query: string;
  onChange: (query: string) => void;
}

export const VideoSearchField = ({ query, onChange }: Props) => {
  const { t } = useLingui();

  return (
    <FieldStyled
      fullWidth
      size="small"
      value={query}
      placeholder={t`Route or author`}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: query ? (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                size="small"
                aria-label={t`Clear`}
                onClick={() => onChange('')}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined
        },
        htmlInput: { 'aria-label': t`Search videos` }
      }}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

const FieldStyled = styled(TextField)`
  & .MuiOutlinedInput-root {
    border-radius: 999px;
  }
`;
