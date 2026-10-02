import type { ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import TerrainIcon from '@mui/icons-material/Terrain';
import TimelineIcon from '@mui/icons-material/Timeline';
import { styled } from '@mui/material/styles';

import type { SearchGroup } from '../lib';

export interface Props {
  group: SearchGroup;
  children: ReactNode;
}

export const CatalogSearchGroup = ({ group, children }: Props) => {
  const { label, Icon } = GROUPS[group];

  return (
    <GroupStyled>
      <HeaderStyled>
        <Icon fontSize="inherit" />
        {label}
      </HeaderStyled>
      <ListStyled>{children}</ListStyled>
    </GroupStyled>
  );
};

const GROUPS: Record<
  SearchGroup,
  { label: ReactNode; Icon: typeof TerrainIcon }
> = {
  regions: { label: <Trans>Regions</Trans>, Icon: TerrainIcon },
  sectors: { label: <Trans>Sectors</Trans>, Icon: PlaceOutlinedIcon },
  routes: { label: <Trans>Routes</Trans>, Icon: TimelineIcon }
};

const GroupStyled = styled('li')`
  & + & {
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
    margin-top: ${({ theme }) => theme.spacing(1)};
  }
`;

const HeaderStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.75)};
  padding: ${({ theme }) => theme.spacing(1.5, 2, 0.5)};
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1.4;
  text-transform: uppercase;
`;

const ListStyled = styled('ul')`
  padding: 0;
  margin: 0;
  list-style: none;
`;
