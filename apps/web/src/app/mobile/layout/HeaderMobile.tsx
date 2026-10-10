import { useState } from 'react';
import { useLocation } from 'react-router';

import AppBar from '@mui/material/AppBar';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';

import { conditionsPlaceOf } from '@web/app/router/conditionsPlaceOf';
import { idRegionOf } from '@web/app/router/idRegionOf';
import { parentPathOf } from '@web/app/router/parentPathOf';
import { ROUTES } from '@web/app/router/routes';
import { CatalogSearchMobile } from '@web/features/catalogSearch';
import { OfflineCtaMobile } from '@web/features/offlineRegions';
import { ConditionsButton } from '@web/features/sectorConditions';
import { Wordmark } from '@web/shared/ui';

import { HeaderBackButton } from './HeaderBackButton';

export const HeaderMobile = () => {
  const { pathname } = useLocation();
  const parentPath = parentPathOf(pathname);
  const idRegion = idRegionOf(pathname);
  const conditionsPlace = conditionsPlaceOf(pathname);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <HeaderStyled position="static" color="transparent" elevation={0}>
      <ToolbarStyled>
        {parentPath ? (
          <HeaderBackButton parentPath={parentPath} />
        ) : (
          <Wordmark to={ROUTES.INDEX} />
        )}
        <SearchSlotStyled>
          {conditionsPlace && !isSearchExpanded && (
            <ConditionsButton place={conditionsPlace} />
          )}
          {idRegion && !isSearchExpanded && (
            <OfflineCtaMobile idRegion={idRegion} />
          )}
          <CatalogSearchMobile onExpandedChange={setIsSearchExpanded} />
        </SearchSlotStyled>
      </ToolbarStyled>
    </HeaderStyled>
  );
};

// `viewport-fit=cover` lets the page run under the status bar; the inset keeps
// the logo and search below it.
const HeaderStyled = styled(AppBar)`
  padding-top: env(safe-area-inset-top);
  background-color: ${({ theme }) => theme.palette.background.default};
`;

const ToolbarStyled = styled(Toolbar)`
  gap: ${({ theme }) => theme.spacing(1)};
`;

const SEARCH_SLOT_HEIGHT = 40;

// Fixed height: the slot swaps a 40px icon button for a text field, and a
// toolbar that changes height shifts the whole page under it.
const SearchSlotStyled = styled('div')`
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: flex-end;
  min-width: 0;
  height: ${SEARCH_SLOT_HEIGHT}px;
  padding-left: ${({ theme }) => theme.spacing(2)};
`;
