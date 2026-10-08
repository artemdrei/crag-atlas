import type { Region } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

import { localNameOf } from '@web/shared/lib';
import { EmptyState } from '@web/shared/ui';

import { useOfflineRegionChoice } from '../common';

export interface Props {
  onSelect: (region: Region) => void;
}

export const OfflineRegionList = ({ onSelect }: Props) => {
  const { t } = useLingui();
  const { options, query, search, isLoading } = useOfflineRegionChoice();

  return (
    <>
      <TextField
        fullWidth
        size="small"
        type="search"
        value={query}
        placeholder={t`Search regions`}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }
        }}
        onChange={(event) => search(event.target.value)}
      />
      {isLoading ? (
        <CenterStyled>
          <CircularProgress size={24} />
        </CenterStyled>
      ) : options.length ? (
        <ListStyled disablePadding>
          {options.map((region) => (
            <ListItemButton key={region.id} onClick={() => onSelect(region)}>
              <ListItemText
                primary={region.name}
                secondary={localNameOf(region.name, region.nameLocal)}
              />
            </ListItemButton>
          ))}
        </ListStyled>
      ) : (
        <EmptyState
          icon={<SearchOffIcon />}
          message={
            query.trim() ? (
              <Trans>No region found</Trans>
            ) : (
              <Trans>All regions are already saved</Trans>
            )
          }
        />
      )}
    </>
  );
};

const ListStyled = styled(List)`
  max-height: 40vh;
  margin: 0 ${({ theme }) => theme.spacing(-2)};
  overflow-y: auto;
`;

const CenterStyled = styled('div')`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)};
`;
