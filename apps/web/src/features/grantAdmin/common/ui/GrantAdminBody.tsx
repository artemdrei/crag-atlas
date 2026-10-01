import { useRef, useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useApiGrantAdmins } from '../hooks';
import { AdminCandidateList } from './AdminCandidateList';

export interface Props {
  onClose: () => void;
}

export const GrantAdminBody = ({ onClose }: Props) => {
  const { t } = useLingui();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const { isPending, grantAdmins } = useApiGrantAdmins({ onGranted: onClose });

  const clear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const toggle = (idUser: string) =>
    setSelected((current) =>
      current.includes(idUser)
        ? current.filter((id) => id !== idUser)
        : [...current, idUser]
    );

  return (
    <BodyStyled>
      <TextField
        autoFocus
        fullWidth
        size="small"
        value={query}
        inputRef={inputRef}
        placeholder={t`Search by name or email`}
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
                  size="small"
                  edge="end"
                  aria-label={t`Clear the search`}
                  onClick={clear}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined
          }
        }}
        onChange={(event) => setQuery(event.target.value)}
      />

      <AdminCandidateList query={query} selected={selected} onToggle={toggle} />

      <FooterStyled>
        {selected.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            <Trans>Selected: {selected.length}</Trans>
          </Typography>
        )}
        <SpacerStyled />
        <Button color="inherit" onClick={onClose}>
          <Trans>Cancel</Trans>
        </Button>
        <Button
          variant="contained"
          disabled={selected.length === 0 || isPending}
          onClick={() => grantAdmins(selected)}
        >
          <Trans>Grant access</Trans>
        </Button>
      </FooterStyled>
    </BodyStyled>
  );
};

const BodyStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const FooterStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const SpacerStyled = styled('div')`
  flex-grow: 1;
`;
