import { useState } from 'react';

import type { VideoRoute } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { RouteOptionList, useApiSearchRoutes } from '../common';

export interface Props {
  idSelected?: string;
  isOpen: boolean;
  onPick: (route: VideoRoute) => void;
  onClose: () => void;
}

export const RoutePickerScreen = ({
  idSelected,
  isOpen,
  onPick,
  onClose
}: Props) => {
  const { t } = useLingui();
  const [query, setQuery] = useState('');
  const { routes, isLoading, term } = useApiSearchRoutes(query);

  return (
    <Dialog fullScreen open={isOpen} onClose={onClose}>
      <HeaderStyled>
        <IconButton edge="start" aria-label={t`Back`} onClick={onClose}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">
          <Trans>Choose a route</Trans>
        </Typography>
      </HeaderStyled>
      <BodyStyled>
        <TextField
          fullWidth
          autoFocus
          value={query}
          placeholder={t`Search for a route`}
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
                    onClick={() => setQuery('')}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined
            }
          }}
          onChange={(event) => setQuery(event.target.value)}
        />
        <RouteOptionList
          routes={routes}
          idSelected={idSelected}
          hasTerm={!!term}
          isLoading={isLoading}
          onPick={onPick}
        />
      </BodyStyled>
    </Dialog>
  );
};

const HeaderStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1, 2)};
  padding-top: calc(${({ theme }) => theme.spacing(1)} + env(safe-area-inset-top));
`;

const BodyStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(0, 2, 2)};
`;
