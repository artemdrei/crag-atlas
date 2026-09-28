import type { CatalogSearch, SearchHit } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { localNameOf } from '@web/shared/lib';

import { searchHitTrail } from '../lib';

export interface Props {
  results: CatalogSearch;
  isLoading: boolean;
  onPick: (hit: SearchHit) => void;
}

export const CatalogSearchResults = ({ results, isLoading, onPick }: Props) => {
  const groups = [
    { key: 'regions', label: <Trans>Regions</Trans>, hits: results.regions },
    { key: 'sectors', label: <Trans>Sectors</Trans>, hits: results.sectors },
    { key: 'routes', label: <Trans>Routes</Trans>, hits: results.routes }
  ].filter(({ hits }) => hits.length > 0);

  if (groups.length === 0) {
    return (
      <EmptyStyled variant="body2" color="text.secondary">
        {isLoading ? <Trans>Searching…</Trans> : <Trans>Nothing found</Trans>}
      </EmptyStyled>
    );
  }

  return (
    <List dense disablePadding>
      {groups.map(({ key, label, hits }) => (
        <li key={key}>
          <SubheaderStyled disableSticky>{label}</SubheaderStyled>
          {hits.map((hit) => {
            const trail = searchHitTrail(hit);
            const localName = localNameOf(hit.name, hit.nameLocal);

            return (
              <ListItemButton key={hit.id} onClick={() => onPick(hit)}>
                <HitStyled>
                  <NameRowStyled variant="body2" noWrap>
                    {hit.name}
                    {!!localName && (
                      <LocalNameStyled>({localName})</LocalNameStyled>
                    )}
                    {!!hit.rating && (
                      <RatingStyled>
                        <StarBorderIcon fontSize="inherit" />
                        {hit.rating.toFixed(1)}
                      </RatingStyled>
                    )}
                  </NameRowStyled>
                  {trail && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {trail}
                    </Typography>
                  )}
                </HitStyled>
              </ListItemButton>
            );
          })}
        </li>
      ))}
    </List>
  );
};

const SubheaderStyled = styled(ListSubheader)`
  background: transparent;
  line-height: 2;
`;

const LocalNameStyled = styled('span')`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const NameRowStyled = styled(Typography)`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(0.75)};
`;

const RatingStyled = styled('span')`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.25)};
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const HitStyled = styled('div')`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const EmptyStyled = styled(Typography)`
  padding: ${({ theme }) => theme.spacing(2)};
`;
